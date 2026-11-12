import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Graphor, {
  FolderScopeNotAppliedError,
  NotFoundError,
  UnprocessableEntityError,
  UploadError,
} from 'graphor';
import { limits, UPLOAD_MAX_ATTEMPTS } from 'graphor/internal/large-upload';

const KIB = 1024;
const CHUNK = 256 * KIB;
const BASE_URL = 'https://api.example.test/v1';
const UPLOAD_URL = 'https://storage.example.test/upload/session?upload_id=secret-session';

type Put = { start: number; end: number; body: Uint8Array };

class FakeServer {
  createStatus = 201;
  createBody: unknown = undefined;
  /** Extra fields of the session answer, such as the `folder` echo. */
  sessionExtra: Record<string, unknown> = {};
  directForms: FormData[] = [];
  chunkSize = CHUNK;
  uploadUrl = UPLOAD_URL;
  stored: number[] = [];
  finished = false;
  requests: { url: string; method: string; headers: Headers }[] = [];
  createCalls: any[] = [];
  completeBodies: any[] = [];
  directCalls = 0;
  onPut: ((put: Put) => Response | undefined) | undefined;
  completeScript: (() => Response)[] = [];

  fetch = async (input: any, init?: any): Promise<Response> => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    this.requests.push({ url, method: init?.method ?? 'GET', headers });
    if (url.startsWith('https://storage.example.test')) return this.storage(headers, init?.body);
    if (url.endsWith('/sources/upload-sessions')) {
      const body = JSON.parse(String(init.body));
      this.createCalls.push(body);
      if (this.createStatus !== 201) {
        return json(this.createStatus, this.createBody ?? { detail: 'no' });
      }
      return json(201, {
        upload_id: 'token',
        build_id: 'bid',
        upload_url: this.uploadUrl,
        chunk_size: this.chunkSize,
        expires_at: '2030-01-01T00:00:00Z',
        ...this.sessionExtra,
      });
    }
    if (url.endsWith('/upload-sessions/complete')) {
      this.completeBodies.push(JSON.parse(String(init.body)));
      const next = this.completeScript.shift();
      return next ? next() : json(200, { build_id: 'bid', success: true });
    }
    if (url.endsWith('/sources/ingest-file')) {
      // Read the multipart body, as a real server does, so a broken stream shows.
      const request = new Request('https://api.example.test/form', {
        method: 'POST',
        body: init.body,
        headers: init.headers,
        duplex: 'half',
      } as any);
      this.directForms.push(await request.formData());
      this.directCalls += 1;
      return json(200, { build_id: 'direct', success: true });
    }
    return json(404, { detail: 'Not Found' });
  };

  private storage(headers: Headers, rawBody: any): Response {
    const range = headers.get('content-range')!;
    if (range.startsWith('bytes */')) return this.status();
    const [span, total] = range.slice('bytes '.length).split('/');
    const [start, end] = span!.split('-').map(Number) as [number, number];
    const body = new Uint8Array(rawBody);
    const replaced = this.onPut?.({ start, end, body });
    if (replaced) return replaced;
    if (start === this.stored.length) this.append(body);
    if (this.stored.length >= Number(total)) {
      this.finished = true;
      return json(200, {});
    }
    return this.status();
  }

  append(bytes: Uint8Array): void {
    for (const byte of bytes) this.stored.push(byte);
  }

  status(): Response {
    if (this.finished) return json(200, {});
    if (!this.stored.length) return new Response(null, { status: 308 });
    return new Response(null, { status: 308, headers: { Range: `bytes=0-${this.stored.length - 1}` } });
  }

  md5(): string {
    return crypto.createHash('md5').update(Buffer.from(this.stored)).digest('base64');
  }
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function data(size = 600 * KIB): Uint8Array {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = (i * 7 + 3) % 251;
  return bytes;
}

function client(server: FakeServer, opts: Record<string, unknown> = {}): Graphor {
  return new Graphor({
    apiKey: 'test-key',
    baseURL: BASE_URL,
    defaultHeaders: { 'X-Custom': 'client-header' },
    fetch: server.fetch as any,
    ...opts,
  });
}

const puts = (server: FakeServer) => server.requests.filter((r) => r.url.startsWith('https://storage'));

let server: FakeServer;
const original = { ...limits };

beforeEach(() => {
  server = new FakeServer();
  limits.direct = 100 * KIB;
  limits.fallback = 200 * KIB;
  limits.sleep = async () => {};
});

afterAll(() => Object.assign(limits, original));

describe('which path', () => {
  test('a small file goes directly', async () => {
    const result = await client(server).sources.ingestFile({ file: new File([data(50 * KIB)], 'a.pdf') });
    expect(result.build_id).toBe('direct');
    expect(server.createCalls).toEqual([]);
  });

  test('a large File goes through a session', async () => {
    const bytes = data();
    const result = await client(server).sources.ingestFile({
      file: new File([bytes], 'Report.PDF'),
      method: 'fast',
    });
    expect(result.build_id).toBe('bid');
    expect(Buffer.from(server.stored).equals(Buffer.from(bytes))).toBe(true);
    expect(server.createCalls).toEqual([
      { file_name: 'Report.PDF', file_size: bytes.length, method: 'fast' },
    ]);
    expect(server.completeBodies).toEqual([{ upload_id: 'token', md5: server.md5() }]);
  });

  test('a read stream is read from its path, near one chunk at a time', async () => {
    const bytes = data();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphor-upload-'));
    const file = path.join(dir, 'big.pdf');
    fs.writeFileSync(file, bytes);
    const stream = fs.createReadStream(file);
    const result = await client(server).sources.ingestFile({ file: stream });
    expect(result.build_id).toBe('bid');
    expect(server.createCalls[0].file_name).toBe('big.pdf');
    expect(Buffer.from(server.stored).equals(Buffer.from(bytes))).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });

  test('no client header reaches the upload URL', async () => {
    await client(server).sources.ingestFile(
      { file: new File([data()], 'a.pdf') },
      // fetchOptions may carry headers at runtime though its type omits them.
      { headers: { 'X-Extra': '1' }, fetchOptions: { headers: { 'X-Fetch': '1' } } as any },
    );
    for (const request of puts(server)) {
      expect(request.headers.get('authorization')).toBeNull();
      expect(request.headers.get('x-custom')).toBeNull();
      expect(request.headers.get('x-extra')).toBeNull();
      expect(request.headers.get('x-fetch')).toBeNull();
      expect(request.headers.get('content-range')).not.toBeNull();
    }
  });

  test('asResponse returns the response of complete', async () => {
    const response = await client(server)
      .sources.ingestFile({ file: new File([data()], 'a.pdf') })
      .asResponse();
    expect(((await response.json()) as { build_id: string }).build_id).toBe('bid');
  });
});

describe('falling back to the direct request', () => {
  test.each([
    [501, { detail: 'Upload sessions are not available' }],
    [404, { detail: 'Not Found' }],
  ])('%s falls back', async (status, body) => {
    server.createStatus = status;
    server.createBody = body;
    const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') });
    expect(result.build_id).toBe('direct');
  });

  test('another 404 is thrown', async () => {
    server.createStatus = 404;
    server.createBody = { detail: 'Project not found' };
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  test('near the limit, a failed upload falls back', async () => {
    server.onPut = () => new Response(null, { status: 403 });
    const result = await client(server).sources.ingestFile({ file: new File([data(150 * KIB)], 'a.pdf') });
    expect(result.build_id).toBe('direct');
  });
});

describe('the upload protocol', () => {
  test('a cut chunk resumes with the right md5', async () => {
    const bytes = data();
    let cut = false;
    server.onPut = ({ start, body }) => {
      if (start === CHUNK && !cut) {
        cut = true;
        server.append(body.subarray(0, CHUNK / 2));
        throw new TypeError('terminated');
      }
      return undefined;
    };
    await client(server).sources.ingestFile({ file: new File([bytes], 'a.pdf') });
    expect(Buffer.from(server.stored).equals(Buffer.from(bytes))).toBe(true);
    expect(server.completeBodies[0].md5).toBe(crypto.createHash('md5').update(bytes).digest('base64'));
  });

  test('a lost session throws without the URL', async () => {
    server.onPut = () => new Response(null, { status: 410 });
    const error = await client(server)
      .sources.ingestFile({ file: new File([data()], 'a.pdf') })
      .catch((e) => e);
    expect(error).toBeInstanceOf(UploadError);
    expect(error.status).toBe(410);
    expect(String(error)).not.toContain('secret-session');
  });

  test('no progress spends the budget', async () => {
    server.onPut = () => {
      throw new TypeError('fetch failed');
    };
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') }),
    ).rejects.toBeInstanceOf(UploadError);
    const sends = puts(server).filter((r) => !r.headers.get('content-range')!.startsWith('bytes */'));
    expect(sends.length).toBe(UPLOAD_MAX_ATTEMPTS);
  });

  test.each([
    ['http://storage.example.test/x', CHUNK],
    [UPLOAD_URL, CHUNK + 1],
    [UPLOAD_URL, 0],
  ])('a bad session throws before sending (%s, %s)', async (url, chunk) => {
    server.uploadUrl = url;
    server.chunkSize = chunk;
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') }),
    ).rejects.toBeInstanceOf(UploadError);
    expect(puts(server)).toEqual([]);
  });
});

describe('complete', () => {
  const envelope =
    (status: number, retryable: boolean, busy = false) =>
    () =>
      new Response(
        '\n\n' + JSON.stringify({ detail: 'x', status_code: status, retryable, retry_after: 1, busy }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );

  test('a retryable envelope is retried', async () => {
    server.completeScript = [envelope(503, true), envelope(503, true, true)];
    const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') });
    expect(result.build_id).toBe('bid');
    expect(server.completeBodies.length).toBe(3);
  });

  test('a 409 waits without spending attempts', async () => {
    server.completeScript = Array(8).fill(() => json(409, { detail: 'busy' }, { 'retry-after': '1' }));
    const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') });
    expect(result.build_id).toBe('bid');
    expect(server.completeBodies.length).toBe(9);
  });

  test('a final envelope is thrown', async () => {
    server.completeScript = [envelope(422, false)];
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  test('no build_id gives up with the build', async () => {
    server.completeScript = Array(10).fill(
      () => new Response('\n\n{}', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    const error = await client(server)
      .sources.ingestFile({ file: new File([data()], 'a.pdf') })
      .catch((e) => e);
    expect(error).toBeInstanceOf(UploadError);
    expect(error.buildId).toBe('bid');
  });

  test('a body that breaks after a heartbeat is retried', async () => {
    server.completeScript = [
      () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('\n'));
              controller.error(new TypeError('terminated'));
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    ];
    const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') });
    expect(result.build_id).toBe('bid');
    expect(server.completeBodies.length).toBe(2);
  });
});

describe('review fixes', () => {
  const tmpFile = (bytes: Uint8Array, name = 'big.pdf') => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphor-upload-'));
    const file = path.join(dir, name);
    fs.writeFileSync(file, bytes);
    return { dir, file };
  };

  test('a silent complete body is cut by the watchdog and retried', async () => {
    limits.watchdog = 50;
    server.completeScript = [
      () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('\n')); // then nothing
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    ];
    try {
      const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') });
      expect(result.build_id).toBe('bid');
      expect(server.completeBodies.length).toBe(2);
    } finally {
      limits.watchdog = original.watchdog;
    }
  });

  test('a 308 without progress spends the budget', async () => {
    let calls = 0;
    server.onPut = () => {
      calls += 1;
      if (calls > 50) throw new Error('no budget'); // a regression would loop forever
      return new Response(null, { status: 308 });
    };
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') }),
    ).rejects.toBeInstanceOf(UploadError);
    const sends = puts(server).filter((r) => !r.headers.get('content-range')!.startsWith('bytes */'));
    expect(sends.length).toBe(UPLOAD_MAX_ATTEMPTS);
  });

  test.each([
    [
      'a failed upload near the limit',
      150 * KIB,
      () => (server.onPut = () => new Response(null, { status: 403 })),
    ],
    ['a 501 above the limit', 600 * KIB, () => (server.createStatus = 501)],
  ])('a read stream falls back directly after %s', async (_label, size, setup) => {
    setup();
    const { dir, file } = tmpFile(data(size));
    const result = await client(server).sources.ingestFile({ file: fs.createReadStream(file) });
    expect(result.build_id).toBe('direct');
    fs.rmSync(dir, { recursive: true });
  });

  test('a small read stream whose file was removed still goes directly', async () => {
    const { dir, file } = tmpFile(data(10 * KIB), 'gone.pdf');
    const stream = fs.createReadStream(file);
    await new Promise((resolve) => stream.once('open', resolve));
    fs.unlinkSync(file);
    const result = await client(server).sources.ingestFile({ file: stream });
    expect(result.build_id).toBe('direct');
    fs.rmSync(dir, { recursive: true });
  });

  test('busy envelopes end at the deadline with the build', async () => {
    server.completeScript = Array(100).fill(
      () =>
        new Response(
          JSON.stringify({ detail: 'busy', status_code: 503, retryable: true, retry_after: 60, busy: true }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    const error = await client(server)
      .sources.ingestFile({ file: new File([data()], 'a.pdf') })
      .catch((e) => e);
    expect(error).toBeInstanceOf(UploadError);
    expect(error.buildId).toBe('bid');
    expect(server.completeBodies.length).toBe(16);
  });

  test('running out of attempts keeps the build', async () => {
    server.completeScript = Array(10).fill(() => json(503, { detail: 'down' }));
    const error = await client(server)
      .sources.ingestFile({ file: new File([data()], 'a.pdf') })
      .catch((e) => e);
    expect(error).toBeInstanceOf(UploadError);
    expect(error.buildId).toBe('bid');
  });

  test('the debug log never shows the upload URL', async () => {
    const lines: string[] = [];
    const capture = (...args: unknown[]) => lines.push(JSON.stringify(args));
    await client(server, {
      logLevel: 'debug',
      logger: { debug: capture, info: capture, warn: capture, error: capture },
    }).sources.ingestFile({ file: new File([data()], 'a.pdf') });
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.join('\n')).not.toContain('secret-session');
  });

  test('a file that grows during the upload throws', async () => {
    const { dir, file } = tmpFile(data());
    let grown = false;
    server.onPut = ({ start }) => {
      if (start === 0 && !grown) {
        grown = true;
        fs.appendFileSync(file, 'more');
      }
      return undefined;
    };
    const error = await client(server)
      .sources.ingestFile({ file: fs.createReadStream(file) })
      .catch((e) => e);
    expect(error).toBeInstanceOf(UploadError);
    expect(String(error)).toContain('changed');
    expect(server.completeBodies).toEqual([]);
    fs.rmSync(dir, { recursive: true });
  });

  test('a range read stream that ends before the file does uploads', async () => {
    const bytes = data(2000 * KIB);
    const { dir, file } = tmpFile(bytes);
    const result = await client(server).sources.ingestFile({
      file: fs.createReadStream(file, { start: 500 * KIB, end: 1500 * KIB - 1 }),
    });
    expect(result.build_id).toBe('bid');
    expect(Buffer.from(server.stored).equals(Buffer.from(bytes.subarray(500 * KIB, 1500 * KIB)))).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });

  test("a failed upload closes the caller's read stream", async () => {
    server.onPut = () => new Response(null, { status: 403 });
    const { dir, file } = tmpFile(data());
    const stream = fs.createReadStream(file);
    await expect(client(server).sources.ingestFile({ file: stream })).rejects.toBeInstanceOf(UploadError);
    expect(stream.destroyed).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });
});

describe('folders', () => {
  test('the session create body carries the folder, and its echo is accepted', async () => {
    server.sessionExtra = { folder: 'Contracts/2026' };
    const result = await client(server).sources.ingestFile({
      file: new File([data()], 'a.pdf'),
      folder: 'Contracts/2026',
    });
    expect(result.build_id).toBe('bid');
    expect(server.createCalls[0]).toEqual({
      file_name: 'a.pdf',
      file_size: 600 * KIB,
      folder: 'Contracts/2026',
    });
  });

  test.each(['/', ' ', ''])('folder %j with an echo of "" uploads normally', async (folder) => {
    server.sessionExtra = { folder: '' };
    const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf'), folder });
    expect(result.build_id).toBe('bid');
    expect(server.createCalls[0].folder).toBe(folder);
    expect(server.finished).toBe(true);
  });

  test.each([
    ['above the fallback limit', 600 * KIB],
    ['between the direct and the fallback limits', 150 * KIB],
  ])('a session without the folder echo throws before any byte is sent, %s', async (_, size) => {
    const error = await client(server)
      .sources.ingestFile({ file: new File([data(size)], 'a.pdf'), folder: 'Contracts' })
      .catch((e) => e);
    expect(error).toBeInstanceOf(FolderScopeNotAppliedError);
    expect(error.parameter).toBe('folder');
    expect(puts(server)).toEqual([]);
    expect(server.directCalls).toBe(0);
    expect(server.completeBodies).toEqual([]);
  });

  test('a null echo is not a folder', async () => {
    server.sessionExtra = { folder: null };
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf'), folder: '' }),
    ).rejects.toBeInstanceOf(FolderScopeNotAppliedError);
    expect(puts(server)).toEqual([]);
  });

  test('without a folder, a session without the echo uploads as before', async () => {
    const result = await client(server).sources.ingestFile({ file: new File([data()], 'a.pdf') });
    expect(result.build_id).toBe('bid');
    expect('folder' in server.createCalls[0]).toBe(false);
  });

  test('a read stream with a folder that gets no echo is released', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphor-upload-'));
    const file = path.join(dir, 'big.pdf');
    fs.writeFileSync(file, data());
    const stream = fs.createReadStream(file);
    await expect(
      client(server).sources.ingestFile({ file: stream, folder: 'Contracts' }),
    ).rejects.toBeInstanceOf(FolderScopeNotAppliedError);
    expect(stream.destroyed).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });

  test.each([
    ['above the fallback limit', 600 * KIB],
    ['between the direct and the fallback limits', 150 * KIB],
  ])('an API without sessions gets no byte of a file with a folder, %s', async (_, size) => {
    server.createStatus = 404;
    server.createBody = { detail: 'Not Found' };
    for (const folder of ['Contracts', '']) {
      const error = await client(server)
        .sources.ingestFile({ file: new File([data(size)], 'a.pdf'), folder })
        .catch((e) => e);
      expect(error).toBeInstanceOf(FolderScopeNotAppliedError);
      expect(error.parameter).toBe('folder');
    }
    expect(server.directCalls).toBe(0);
    expect(puts(server)).toEqual([]);
  });

  test('a read stream with a folder is released when the API has no sessions', async () => {
    server.createStatus = 404;
    server.createBody = { detail: 'Not Found' };
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphor-upload-'));
    const file = path.join(dir, 'big.pdf');
    fs.writeFileSync(file, data());
    const stream = fs.createReadStream(file);
    await expect(
      client(server).sources.ingestFile({ file: stream, folder: 'Contracts' }),
    ).rejects.toBeInstanceOf(FolderScopeNotAppliedError);
    expect(stream.destroyed).toBe(true);
    expect(server.directCalls).toBe(0);
    fs.rmSync(dir, { recursive: true });
  });

  test('another 404 with a folder is thrown as it is', async () => {
    server.createStatus = 404;
    server.createBody = { detail: 'Project not found', code: 'project.not_found' };
    await expect(
      client(server).sources.ingestFile({ file: new File([data()], 'a.pdf'), folder: 'Contracts' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(server.directCalls).toBe(0);
  });

  test('the direct fallback carries the folder', async () => {
    server.createStatus = 501;
    const result = await client(server).sources.ingestFile({
      file: new File([data(150 * KIB)], 'a.pdf'),
      folder: 'Contracts',
    });
    expect(result.build_id).toBe('direct');
    expect(server.directForms[0]!.get('folder')).toBe('Contracts');
  });

  test.each(['Contracts', ''])('a small file sends folder %j in the form', async (folder) => {
    await client(server).sources.ingestFile({ file: new File([data(50 * KIB)], 'a.pdf'), folder });
    expect(server.directForms[0]!.get('folder')).toBe(folder);
  });

  test('a small file without a folder sends none', async () => {
    await client(server).sources.ingestFile({ file: new File([data(50 * KIB)], 'a.pdf') });
    expect(server.directForms[0]!.has('folder')).toBe(false);
  });
});
