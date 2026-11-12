/**
 * Folder parameters fail closed.
 *
 * The API echoes every folder filter and scope it applies: `folder` on each
 * listed source, `folders` on an answer of `ask`, `extract` and
 * `retrieveChunks`, and `folder` on an upload session. A response without the
 * echo comes from a server that ignored the parameter, so its result would
 * cover more sources than asked for; the SDK throws
 * `FolderScopeNotAppliedError` instead of returning it.
 */

import type { Graphor } from '../client';
import { APIPromise } from '../core/api-promise';
import { FolderScopeNotAppliedError, GraphorError, NotFoundError } from '../core/error';
import { responseProps } from './large-upload';
import type { APIResponseProps } from './parse';
import type { RequestOptions } from './request-options';

/**
 * Whether a folder value names the top level: only spaces (U+0020) and `/`,
 * the empty string included. Exactly what the API strips from both ends of a
 * path; other blanks (a tab, a no-break space) are not stripped.
 */
export function isTopLevelFolder(folder: string): boolean {
  return /^[ /]*$/.test(folder);
}

/**
 * A response body that a streamed late failure produced: an integer
 * `status_code` and a `detail`.
 */
function isStreamedError(
  data: unknown,
): data is { status_code: number; detail: unknown; retry_after?: unknown } {
  if (data == null || typeof data !== 'object') return false;
  const body = data as Record<string, unknown>;
  return Number.isInteger(body['status_code']) && body['detail'] != null;
}

/**
 * Throws, without sending anything, when `folders` is given but is not an
 * array: a string or another value could not be checked against the echo.
 */
export function checkFoldersType(body: { folders?: unknown } | null | undefined): void {
  const folders = body?.folders;
  if (folders != null && !Array.isArray(folders)) {
    throw new GraphorError('`folders` must be an array of folder paths, such as ["Contracts"].');
  }
}

/** A rejected `APIPromise`, for a call refused before any request. */
export function refused<T>(client: Graphor, error: unknown): APIPromise<T> {
  const props = Promise.reject(error);
  // Handled when the caller awaits it; never an unhandled rejection before that.
  props.catch(() => {});
  return new APIPromise<T>(client, props);
}

/** Checks a list answer for the `folder` field on every source. */
export function checkListed<T>(parameter: string): (data: T) => T {
  return (data: T) => {
    if (Array.isArray(data) && data.some((source) => typeof source?.folder !== 'string')) {
      throw new FolderScopeNotAppliedError(
        parameter,
        `The API did not apply the \`${parameter}\` filter: the listed sources carry no folder. ` +
          'The SDK refused the result, which may list every source of the project.',
      );
    }
    return data;
  };
}

/**
 * Checks an answer scoped with `folders`: a late failure the server streamed
 * throws its status error; an answer without the `folders` echo throws
 * `FolderScopeNotAppliedError`.
 */
export function checkScoped<T>(client: Graphor): (data: T, props: APIResponseProps) => T {
  return (data: T, props: APIResponseProps) => {
    if (isStreamedError(data)) {
      const status = data.status_code >= 400 ? data.status_code : 500;
      // The real headers are those of a 200: the retry hint is in the body.
      const headers = new Headers(props.response.headers);
      headers.delete('retry-after');
      if (typeof data.retry_after === 'number' && Number.isFinite(data.retry_after)) {
        headers.set('retry-after', String(data.retry_after));
      }
      throw (client as any).makeStatusError(status, data, undefined, headers);
    }
    const folders = (data as any)?.folders;
    if (!Array.isArray(folders) || folders.length === 0) {
      const conversationId = (data as any)?.conversation_id;
      throw new FolderScopeNotAppliedError(
        'folders',
        'The API did not apply the `folders` scope: the answer carries no `folders`. ' +
          'The SDK refused the result, which may draw on every source of the project.',
        typeof conversationId === 'string' ? { conversationId } : {},
      );
    }
    return data;
  };
}

/** Whether a not-found error is the framework's own 404, with no `code`. */
function isMissingRoute(error: unknown): boolean {
  if (!(error instanceof NotFoundError)) return false;
  const body = error.error as any;
  return !(body && typeof body === 'object' && typeof body.code === 'string' && body.code);
}

/**
 * The request of a folder method, with a 404 that has no `code` (a server
 * without the route) thrown as `FolderScopeNotAppliedError`. A 404 with
 * `code: "folder.not_found"` stays a `NotFoundError`.
 */
export function folderRequest<T>(
  client: Graphor,
  request: APIPromise<T>,
  method: 'get' | 'post',
  path: string,
  options: RequestOptions | undefined,
): APIPromise<T> {
  const props = (async () => {
    const startTime = Date.now();
    let response: Response;
    try {
      response = await request.asResponse();
    } catch (error) {
      if (isMissingRoute(error)) {
        const route = `${method.toUpperCase()} ${path}`;
        throw new FolderScopeNotAppliedError(
          route,
          `The API does not offer \`${route}\`: it answered 404 without a code. ` +
            'Nothing was changed by this call.',
        );
      }
      throw error;
    }
    return responseProps(response, path, options, startTime, method);
  })();
  return new APIPromise<T>(client, props);
}
