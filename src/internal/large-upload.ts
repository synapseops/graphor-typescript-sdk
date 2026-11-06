/**
 * Uploads above the direct upload limit.
 *
 * `sources.ingestFile` sends a file larger than `DIRECT_UPLOAD_MAX_BYTES` to an
 * upload session instead of a single request: it creates the session, sends the
 * bytes to the session's upload URL in chunks, resuming after a failure, and
 * completes it. The call returns what the direct request returns.
 *
 * The upload URL needs no other credential, so it never goes in a log or an
 * error, and the client's headers never go to it.
 */

import type { Graphor } from '../client';
import { APIError, APIUserAbortError, GraphorError, UploadError } from '../core/error';
import type { APIResponseProps } from './parse';
import type { FinalRequestOptions, RequestOptions } from './request-options';
import { ReadableStreamFrom } from './shims';
import { getName, makeFile, type Uploadable } from './uploads';
import { sleep } from './utils/sleep';

const MIB = 1024 * 1024;
const CHUNK_UNIT = 256 * 1024;
const MAX_CHUNK_SIZE = 64 * MIB;

/** Files up to this size go in one request, as before. */
export const DIRECT_UPLOAD_MAX_BYTES = 30 * MIB;
/** Up to this size a file can still go in one request if a session fails. */
export const DIRECT_FALLBACK_MAX_BYTES = 31 * MIB;
/** Attempts per chunk without progress, and the minimum for complete. */
export const UPLOAD_MAX_ATTEMPTS = 5;
/** How long complete may wait on another attempt or a busy server. */
export const COMPLETE_DEADLINE_MS = 900_000;
/** A complete that sends nothing for this long is retried. */
export const BODY_WATCHDOG_MS = 60_000;

const CREATE_PATH = '/sources/upload-sessions';
const COMPLETE_PATH = '/sources/upload-sessions/complete';

/** Limits, kept on an object so tests can lower them. */
export const limits = {
  direct: DIRECT_UPLOAD_MAX_BYTES,
  fallback: DIRECT_FALLBACK_MAX_BYTES,
  sleep,
};

type UploadSession = {
  upload_id: string;
  build_id: string;
  upload_url: string;
  chunk_size: number;
};

type Source = {
  name: string;
  size: number;
  read(offset: number, length: number): Promise<Uint8Array>;
  close(): Promise<void>;
};

// ---------------------------------------------------------------------------
// Node built-ins, looked up at runtime so bundles stay free of `node:` imports
// ---------------------------------------------------------------------------

async function builtin(name: 'fs' | 'crypto'): Promise<any | undefined> {
  const process = (globalThis as any).process;
  try {
    const found = process?.getBuiltinModule?.(`node:${name}`);
    if (found) return found;
  } catch {
    // fall through
  }
  try {
    return await (Function(`return import("node:${name}")`)() as Promise<any>);
  } catch {
    return undefined;
  }
}

function newMd5(crypto: any): any | undefined {
  try {
    return crypto?.createHash('md5');
  } catch {
    // FIPS: no MD5, so none is sent
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Measuring the file
// ---------------------------------------------------------------------------

const isBlob = (value: any): value is Blob =>
  value != null &&
  typeof value === 'object' &&
  typeof value.size === 'number' &&
  typeof value.slice === 'function';

const isReadStream = (
  value: any,
): value is AsyncIterable<Uint8Array> & { path: any; start?: number; end?: number } =>
  value != null &&
  typeof value === 'object' &&
  'path' in value &&
  value.path != null &&
  typeof value[Symbol.asyncIterator] === 'function';

/** Whether a file's size is known now and is within the direct limit. */
export function isSmallBlob(file: unknown): boolean {
  return isBlob(file) && file.size <= limits.direct;
}

function blobSource(blob: Blob, name: string): Source {
  return {
    name,
    size: blob.size,
    read: async (offset, length) => new Uint8Array(await blob.slice(offset, offset + length).arrayBuffer()),
    close: async () => {},
  };
}

/**
 * `[file for the direct request, source when above the limit]`. A `File` or a
 * read stream is read in slices; a `Response` or another stream is read into
 * memory first, as the direct request does.
 */
async function prepare(file: Uploadable): Promise<[Uploadable, Source | null]> {
  const name = getName(file) ?? 'unknown_file';
  if (isBlob(file)) {
    return [file, file.size > limits.direct ? blobSource(file, name) : null];
  }
  if (isReadStream(file)) {
    const fs = await builtin('fs');
    if (!fs) return [file, null];
    const path = String(file.path);
    const stat = await fs.promises.stat(path);
    const start = file.start ?? 0;
    const end =
      file.end !== undefined && file.end !== Infinity ? Math.min(file.end + 1, stat.size) : stat.size;
    const size = Math.max(0, end - start);
    if (size <= limits.direct) return [file, null];
    const handle = await fs.promises.open(path, 'r');
    return [
      file,
      {
        name,
        size,
        read: async (offset, length) => {
          const buffer = new Uint8Array(length);
          let filled = 0;
          while (filled < length) {
            const { bytesRead } = await handle.read(buffer, filled, length - filled, start + offset + filled);
            if (!bytesRead) break;
            filled += bytesRead;
          }
          return buffer.subarray(0, filled);
        },
        close: async () => {
          await handle.close();
          (file as any).destroy?.();
        },
      },
    ];
  }
  // A Response or another stream: its size is only known after reading it.
  const blob: Blob =
    typeof (file as any).blob === 'function' ?
      await (file as any).blob()
    : await new Response(ReadableStreamFrom(file as AsyncIterable<Uint8Array>)).blob();
  const replacement = makeFile([blob], name);
  return [replacement, blob.size > limits.direct ? blobSource(blob, name) : null];
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

function fallsBack(error: unknown, size: number): boolean {
  if (size <= limits.fallback) return !(error instanceof APIUserAbortError);
  if (error instanceof APIError) {
    if (error.status === 501) return true;
    // A server without sessions answers the framework's own 404.
    const body = error.error as any;
    return error.status === 404 && body?.detail === 'Not Found' && Object.keys(body).length === 1;
  }
  return false;
}

function uploadError(
  message: string,
  offset: number,
  extra: { status?: number | undefined; buildId?: string | undefined; cause?: unknown } = {},
): UploadError {
  const error = new UploadError(message, { offset, status: extra.status, buildId: extra.buildId });
  if (extra.cause !== undefined) (error as any).cause = extra.cause;
  return error;
}

function checkSession(session: UploadSession): void {
  let url: URL;
  try {
    url = new URL(session.upload_url);
  } catch {
    throw uploadError('The upload URL is not valid.', 0);
  }
  if (url.protocol !== 'https:') throw uploadError('The upload URL is not https.', 0);
  const size = session.chunk_size;
  if (!Number.isInteger(size) || size <= 0 || size % CHUNK_UNIT || size > MAX_CHUNK_SIZE) {
    throw uploadError('The upload chunk size is not valid.', 0);
  }
}

const backoff = (attempt: number) => Math.min(500 * 2 ** attempt, 8000) * (1 - 0.25 * Math.random());

function retryAfterMs(headers: Headers | undefined): number | undefined {
  const value = headers?.get('retry-after');
  const seconds = value != null ? Number(value) : NaN;
  return Number.isFinite(seconds) ? seconds * 1000 : undefined;
}

const isTransient = (status: number) => status === 408 || status === 429 || status >= 500;

function checkAbort(signal: AbortSignal | null | undefined): void {
  if (signal?.aborted) throw new APIUserAbortError();
}

// ---------------------------------------------------------------------------
// Sending the bytes
// ---------------------------------------------------------------------------

async function put(
  client: Graphor,
  url: string,
  body: Uint8Array,
  contentRange: string,
  timeout: number,
  options: RequestOptions | undefined,
): Promise<Response> {
  // The client's fetch and fetch options, so proxies and agents still apply,
  // but its headers never: they are set last, and redirects are not followed.
  const init: RequestInit = {
    ...((client as any).fetchOptions ?? {}),
    ...((options?.fetchOptions as RequestInit | undefined) ?? {}),
    method: 'PUT',
    headers: { 'Content-Range': contentRange },
    body: body as any,
    redirect: 'manual',
    signal: options?.signal ?? undefined,
  };
  const response = await client.fetchWithTimeout(url, init, timeout, new AbortController());
  await response.arrayBuffer();
  return response;
}

function persisted(response: Response): number | null {
  if (response.status === 200 || response.status === 201) return null;
  const range = response.headers.get('range');
  if (!range) return 0;
  const upper = Number(range.split('-').pop());
  return Number.isFinite(upper) ? upper + 1 : 0;
}

async function sendChunks(
  client: Graphor,
  session: UploadSession,
  source: Source,
  options: RequestOptions | undefined,
): Promise<string | undefined> {
  const url = session.upload_url;
  const timeout = options?.timeout ?? client.timeout;
  const crypto = await builtin('crypto');
  const md5 = newMd5(crypto);
  let offset = 0;
  let sentUpto = 0;
  let hashedUpto = 0;
  let attempts = 0;
  let status: number | undefined;

  const advance = (next: number | null) => {
    if (next === null) {
      offset = source.size;
      return true;
    }
    if (next > sentUpto || next > source.size) {
      throw uploadError('The upload reported more bytes than were sent.', next);
    }
    attempts = next > offset ? 0 : attempts + 1;
    offset = next;
    return false;
  };

  for (;;) {
    checkAbort(options?.signal);
    const end = Math.min(offset + session.chunk_size, source.size);
    const data = await source.read(offset, end - offset);
    if (data.length !== end - offset)
      throw uploadError('The file changed while it was being uploaded.', offset);
    // Only bytes past the hashed point: a resume re-reads part of a chunk.
    if (md5 && end > hashedUpto) {
      md5.update(hashedUpto > offset ? data.subarray(hashedUpto - offset) : data);
      hashedUpto = end;
    }
    sentUpto = Math.max(sentUpto, end);

    let response: Response | undefined;
    try {
      response = await put(client, url, data, `bytes ${offset}-${end - 1}/${source.size}`, timeout, options);
      status = response.status;
    } catch (error) {
      if (error instanceof APIUserAbortError || options?.signal?.aborted) throw new APIUserAbortError();
      response = undefined;
    }

    if (response && (status === 200 || status === 201 || status === 308)) {
      if (advance(persisted(response))) break;
      continue;
    }
    if (response && status !== undefined && (status === 404 || status === 410)) {
      throw uploadError('The upload session expired or was lost.', offset, { status });
    }
    if (response && status !== undefined && !isTransient(status)) {
      throw uploadError('The upload was rejected.', offset, { status });
    }

    await limits.sleep(retryAfterMs(response?.headers) ?? backoff(attempts));
    let next: number | null = offset;
    try {
      const query = await put(client, url, new Uint8Array(0), `bytes */${source.size}`, timeout, options);
      if (query.status === 200 || query.status === 201 || query.status === 308) next = persisted(query);
      else if (query.status === 404 || query.status === 410) {
        throw uploadError('The upload session expired or was lost.', offset, { status: query.status });
      }
    } catch (error) {
      if (error instanceof UploadError) throw error;
      if (options?.signal?.aborted) throw new APIUserAbortError();
    }
    if (advance(next)) break;
    if (attempts >= UPLOAD_MAX_ATTEMPTS) {
      throw uploadError('The upload failed after several attempts.', offset, { status });
    }
  }
  return md5 && hashedUpto === source.size ? md5.digest('base64') : undefined;
}

// ---------------------------------------------------------------------------
// Completing
// ---------------------------------------------------------------------------

/** Reads a body to its end; no byte for `BODY_WATCHDOG_MS` ends the attempt. */
async function readWithWatchdog(response: Response): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const silent = new Promise<'silent'>((resolve) => {
      timer = setTimeout(() => resolve('silent'), BODY_WATCHDOG_MS);
    });
    const next = await Promise.race([reader.read(), silent]).finally(() => clearTimeout(timer));
    if (next === 'silent') {
      await reader.cancel().catch(() => {});
      throw new GraphorError('The upload completion stopped responding.');
    }
    if (next.done) return text + decoder.decode();
    text += decoder.decode(next.value, { stream: true });
  }
}

type Verdict = 'free' | 'retry' | 'final';

function statusVerdict(status: number, headers: Headers | undefined): Verdict {
  if (headers?.get('x-conversion-busy') === 'true' || (status === 409 && headers?.get('retry-after'))) {
    return 'free';
  }
  const shouldRetry = headers?.get('x-should-retry');
  if (shouldRetry != null) return shouldRetry === 'true' ? 'retry' : 'final';
  return status === 408 || status === 409 || status === 429 || status >= 500 ? 'retry' : 'final';
}

function envelopeVerdict(data: any): Verdict {
  if (data.busy) return 'free';
  return data.retryable ? 'retry' : 'final';
}

async function complete(
  client: Graphor,
  session: UploadSession,
  md5: string | undefined,
  options: RequestOptions | undefined,
): Promise<APIResponseProps> {
  const body: Record<string, string> = { upload_id: session.upload_id };
  if (md5) body['md5'] = md5;
  const budget = Math.max(client.maxRetries, UPLOAD_MAX_ATTEMPTS);
  let attempts = 0;
  let waited = 0;
  let last: unknown;
  for (;;) {
    checkAbort(options?.signal);
    let verdict: Verdict = 'retry';
    let delay: number | undefined;
    const startTime = Date.now();
    try {
      const response = await client.post(COMPLETE_PATH, { ...options, body, maxRetries: 0 }).asResponse();
      const text = await readWithWatchdog(response.clone());
      waited = 0;
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = undefined;
      }
      if (data?.build_id) return responseProps(response, COMPLETE_PATH, options, startTime);
      if (data && typeof data === 'object' && 'status_code' in data) {
        verdict = envelopeVerdict(data);
        const status = Number(data.status_code) >= 400 ? Number(data.status_code) : 500;
        last = APIError.generate(status, data, String(data.detail ?? 'Upload failed'), response.headers);
        delay = typeof data.retry_after === 'number' ? data.retry_after * 1000 : undefined;
        if (verdict === 'final') throw last;
      } else {
        last = undefined;
      }
    } catch (error) {
      if (error === last && verdict === 'final') throw error;
      if (error instanceof APIUserAbortError) throw error;
      if (error instanceof APIError && error.status !== undefined) {
        verdict = statusVerdict(error.status, error.headers);
        if (verdict === 'final') throw error;
        delay = retryAfterMs(error.headers);
      }
      last = error;
    }

    if (verdict === 'free') {
      delay = delay || 20_000;
      waited += delay;
      if (waited > COMPLETE_DEADLINE_MS) throw gaveUp(session, last);
    } else {
      attempts += 1;
      if (attempts >= budget) {
        if (last instanceof APIError && last.status !== undefined) throw last;
        throw gaveUp(session, last);
      }
      delay = delay || backoff(attempts);
    }
    await limits.sleep(delay);
  }
}

function gaveUp(session: UploadSession, cause: unknown): UploadError {
  return uploadError(
    'The upload was sent but could not be completed. Check the build before uploading again.',
    -1,
    { buildId: session.build_id, cause },
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export type IngestFileBody = { file: Uploadable };

/**
 * The response of `ingestFile` for any file: a direct request at or below the
 * limit, otherwise an upload session, falling back to the direct request when
 * sessions are not available.
 */
export async function ingestFileProps<B extends IngestFileBody>(
  client: Graphor,
  body: B,
  options: RequestOptions | undefined,
  direct: (body: B) => Promise<APIResponseProps>,
): Promise<APIResponseProps> {
  const [file, source] = await prepare(body.file);
  const directBody = { ...body, file };
  if (!source) return direct(directBody);

  try {
    if (!(await builtin('fs'))) {
      throw new GraphorError(
        'Files above the direct upload limit need a server runtime (Node.js, Bun or Deno) in this version.',
      );
    }
    let session: UploadSession;
    try {
      const createBody: Record<string, unknown> = { file_name: source.name, file_size: source.size };
      for (const key of ['method', 'enrichment', 'indexing'] as const) {
        const value = (body as Record<string, unknown>)[key];
        if (value != null) createBody[key] = value;
      }
      session = (await client.post(CREATE_PATH, { ...options, body: createBody })) as UploadSession;
    } catch (error) {
      if (fallsBack(error, source.size)) return direct(directBody);
      throw error;
    }
    checkSession(session);
    let md5: string | undefined;
    try {
      md5 = await sendChunks(client, session, source, options);
    } catch (error) {
      if (error instanceof UploadError && source.size <= limits.fallback) return direct(directBody);
      throw error;
    }
    return await complete(client, session, md5, options);
  } finally {
    await source.close();
  }
}

/** Response props for a request made outside `makeRequest`. */
export function responseProps(
  response: Response,
  path: string,
  options: RequestOptions | undefined,
  startTime: number,
): APIResponseProps {
  return {
    response,
    options: { method: 'post', path, ...options } as FinalRequestOptions,
    controller: new AbortController(),
    requestLogID: 'upload',
    retryOfRequestLogID: undefined,
    startTime,
  };
}
