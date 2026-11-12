import Graphor, {
  BadRequestError,
  FolderScopeNotAppliedError,
  InternalServerError,
  NotFoundError,
  GraphorError,
  APIError,
} from 'graphor';

const BASE_URL = 'https://api.example.test/v1';

type Call = { method: string; url: URL; body: any };
type Reply = () => Response | Promise<Response>;

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

const source = (extra: Record<string, unknown> = {}) => ({
  file_id: 'f1',
  file_name: 'a.pdf',
  file_size: 1,
  file_source: 'local_file',
  file_type: 'pdf',
  message: 'Source processed successfully',
  project_id: 'p',
  project_name: 'P',
  status: 'completed',
  ...extra,
});

class FakeApi {
  calls: Call[] = [];
  replies: Reply[] = [];
  fallback: Reply = () => json(200, {});

  reply(...replies: Reply[]): this {
    this.replies.push(...replies);
    return this;
  }

  fetch = async (input: any, init?: any): Promise<Response> => {
    const url = new URL(String(input));
    let body: any = undefined;
    if (typeof init?.body === 'string') body = JSON.parse(init.body);
    this.calls.push({ method: init?.method ?? 'GET', url, body });
    return (this.replies.shift() ?? this.fallback)();
  };

  query(index = 0): [string, string][] {
    return [...this.calls[index]!.url.searchParams.entries()];
  }
}

let api: FakeApi;

function client(opts: Record<string, unknown> = {}): Graphor {
  return new Graphor({ apiKey: 'test-key', baseURL: BASE_URL, fetch: api.fetch as any, ...opts });
}

beforeEach(() => {
  api = new FakeApi();
});

describe('list: the folder filter on the wire', () => {
  test('no folder parameter sends none', async () => {
    api.reply(() => json(200, [source()]));
    await client().sources.list();
    expect(api.query()).toEqual([]);
  });

  test('a path and recursive are sent as given', async () => {
    api.reply(() => json(200, [source({ folder: 'Contracts' })]));
    await client().sources.list({ folder: 'Contracts', recursive: false });
    expect(api.query()).toEqual([
      ['folder', 'Contracts'],
      ['recursive', 'false'],
    ]);
  });

  test('a path with a comma stays one value', async () => {
    api.reply(() => json(200, []));
    await client().sources.list({ folder: 'Smith, Jones/2026', file_ids: ['x', 'y'] });
    expect(api.query()).toEqual([
      ['file_ids', 'x,y'],
      ['folder', 'Smith, Jones/2026'],
    ]);
  });

  test.each(['', '/', ' ', '//', ' / ', '  //  '])(
    'the top level %j is sent as recursive=false with no folder',
    async (folder) => {
      for (const recursive of [undefined, true, false]) {
        api.reply(() => json(200, [source({ folder: '' })]));
        await client().sources.list({ folder, ...(recursive !== undefined && { recursive }) });
        expect(api.query(api.calls.length - 1)).toEqual([['recursive', 'false']]);
      }
    },
  );

  test.each(['\t', '\n', ' ', '　', ' \t/'])(
    '%j is not the top level and is sent as given',
    async (folder) => {
      api.reply(() => json(200, []));
      await client().sources.list({ folder });
      expect(api.query()).toEqual([['folder', folder]]);
    },
  );

  test('a null folder from untyped code is not sent', async () => {
    api.reply(() => json(200, [source()]));
    await client().sources.list({ folder: null } as any);
    expect(api.query()).toEqual([]);
  });

  test('recursive alone is sent', async () => {
    api.reply(() => json(200, [source({ folder: '' })]));
    await client().sources.list({ recursive: false });
    expect(api.query()).toEqual([['recursive', 'false']]);
  });
});

describe('list: a filter the API did not apply', () => {
  test.each([
    { folder: 'Contracts' },
    { folder: '/' },
    { folder: '' },
    { recursive: false },
    { recursive: true },
  ])('throws for %j when a source has no folder', async (params) => {
    api.reply(() => json(200, [source({ folder: 'Contracts' }), source()]));
    const error = await client()
      .sources.list(params)
      .catch((e) => e);
    expect(error).toBeInstanceOf(FolderScopeNotAppliedError);
    expect(error).toBeInstanceOf(GraphorError);
    expect(error).not.toBeInstanceOf(APIError);
    expect(error.parameter).toBe('folder' in params ? 'folder' : 'recursive');
  });

  test('passes without a folder parameter', async () => {
    api.reply(() => json(200, [source()]));
    expect(await client().sources.list()).toHaveLength(1);
  });

  test('passes when every source carries its folder, the top level included', async () => {
    api.reply(() => json(200, [source({ folder: 'Contracts' }), source({ folder: 'Contracts/2026' })]));
    expect(await client().sources.list({ folder: 'Contracts' })).toHaveLength(2);
  });

  test('an empty answer passes', async () => {
    api.reply(() => json(200, []));
    expect(await client().sources.list({ folder: 'Contracts' })).toEqual([]);
  });

  test('withResponse is checked, asResponse is not', async () => {
    api.reply(() => json(200, [source()]));
    await expect(client().sources.list({ folder: 'X' }).withResponse()).rejects.toBeInstanceOf(
      FolderScopeNotAppliedError,
    );
    api.reply(() => json(200, [source()]));
    const response = await client().sources.list({ folder: 'X' }).asResponse();
    expect(response.status).toBe(200);
  });
});

describe.each([
  ['ask', '/sources/ask-sources', { question: 'q' }, { answer: 'a', conversation_id: 'conv-1' }],
  ['extract', '/sources/run-extraction', { user_instruction: 'u', output_schema: {} }, { file_names: [] }],
  ['retrieveChunks', '/sources/prebuilt-rag', { query: 'q' }, { query: 'q', total: 0 }],
] as const)('%s with folders', (method, path, required, answer) => {
  const call = (body: Record<string, unknown>) => (client().sources as any)[method]({ ...required, ...body });

  test('sends folders in the body', async () => {
    api.reply(() => json(200, { ...answer, folders: ['Contracts'] }));
    const result = await call({ folders: ['Contracts'] });
    expect(api.calls[0]!.url.pathname).toBe(`/v1${path}`);
    expect(api.calls[0]!.body.folders).toEqual(['Contracts']);
    expect(result.folders).toEqual(['Contracts']);
  });

  test.each([[undefined], [null], [[]]])('folders %j is not checked', async (folders) => {
    api.reply(() => json(200, answer));
    const body = folders === undefined ? {} : { folders };
    expect(await call(body)).toEqual(answer);
  });

  test.each([undefined, null, []])('an answer whose folders is %j throws', async (echo) => {
    api.reply(() => json(200, echo === undefined ? answer : { ...answer, folders: echo }));
    const error = await call({ folders: ['Contracts'] }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(FolderScopeNotAppliedError);
    expect(error.parameter).toBe('folders');
    if (method === 'ask') expect(error.conversationId).toBe('conv-1');
  });

  test.each([
    [{ detail: 'x', status_code: '503' }],
    [{ detail: null, status_code: 503 }],
    [{ detail: 'x', status_code: 503.5 }],
    [{ detail: 'x', status_code: true }],
  ])('%j is not a streamed failure, and has no echo', async (body) => {
    api.reply(() => json(200, body));
    await expect(call({ folders: ['Contracts'] })).rejects.toBeInstanceOf(FolderScopeNotAppliedError);
  });

  test('a streamed failure without retry_after has no retry-after header', async () => {
    api.reply(() => json(200, { detail: 'x', code: 'internal', status_code: 500 }, { 'retry-after': '99' }));
    const error = await call({ folders: ['Contracts'] }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(InternalServerError);
    expect(error.headers.get('retry-after')).toBeNull();
  });

  test.each([['Contracts'], [{ 0: 'Contracts' }], [1]])(
    'a folders that is not an array (%j) is refused before sending',
    async (folders) => {
      for (const read of ['await', 'withResponse', 'asResponse'] as const) {
        const promise = call({ folders });
        const pending =
          read === 'await' ? promise
          : read === 'withResponse' ? promise.withResponse()
          : promise.asResponse();
        const error = await pending.catch((e: unknown) => e);
        expect(error).toBeInstanceOf(GraphorError);
        expect(error).not.toBeInstanceOf(APIError);
        expect(error.message).toContain('array');
      }
      expect(api.calls).toEqual([]);
    },
  );

  test('a body with detail and no status_code (a server without folders) throws', async () => {
    api.reply(() => json(200, { detail: 'Something failed', code: 'internal' }));
    await expect(call({ folders: ['Contracts'] })).rejects.toBeInstanceOf(FolderScopeNotAppliedError);
  });

  test('a streamed 503 throws the status error, not the folder error', async () => {
    const envelope = {
      detail: 'Temporarily unavailable',
      code: 'service.unavailable',
      reference: 'ref-1',
      status_code: 503,
      retryable: true,
      retry_after: 30,
      busy: false,
    };
    for (const read of ['await', 'withResponse'] as const) {
      api.reply(() => json(200, envelope));
      const promise = call({ folders: ['Contracts'] });
      const error = await (read === 'await' ? promise : promise.withResponse()).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.status).toBe(503);
      expect(error.error).toEqual(envelope);
      expect(error.headers.get('retry-after')).toBe('30');
    }
  });

  test('a streamed 400 throws BadRequestError', async () => {
    api.reply(() => json(200, { detail: 'No', code: 'chat.folder_scope_empty', status_code: 400 }));
    await expect(call({ folders: ['Contracts'] })).rejects.toBeInstanceOf(BadRequestError);
  });

  test('withResponse is checked, asResponse is not', async () => {
    api.reply(() => json(200, answer));
    await expect(call({ folders: ['Contracts'] }).withResponse()).rejects.toBeInstanceOf(
      FolderScopeNotAppliedError,
    );
    api.reply(() => json(200, answer));
    expect((await call({ folders: ['Contracts'] }).asResponse()).status).toBe(200);
  });
});

const folderMethods = [
  ['listFolders', 'GET', '/sources/folders', undefined, { folders: [{ folder: 'A' }], truncated: false }],
  ['createFolder', 'POST', '/sources/create-folder', { folder: 'A' }, { folder: 'A', created: true }],
  [
    'renameFolder',
    'POST',
    '/sources/rename-folder',
    { folder: 'A', new_folder: 'B', merge: true },
    { folder: 'A', new_folder: 'B', moved: 2 },
  ],
  [
    'removeFolder',
    'POST',
    '/sources/remove-folder',
    { folder: 'A/B' },
    { folder: 'A/B', parent: 'A', moved: 1 },
  ],
  ['deleteFolder', 'POST', '/sources/delete-folder', { folder: 'A' }, { folder: 'A', deleted: 1 }],
  [
    'move',
    'POST',
    '/sources/move-sources',
    { file_ids: ['f1', 'f2'], folder: '' },
    { folder: '', moved: 1, not_found: ['f2'] },
  ],
] as const;

describe.each(folderMethods)('%s', (method, httpMethod, path, params, answer) => {
  const call = (options?: Record<string, unknown>) => {
    const sources = client({ maxRetries: 0 }).sources as any;
    return params === undefined ? sources[method](options) : sources[method](params, options);
  };

  test('sends the request and returns the answer', async () => {
    api.reply(() => json(200, answer));
    expect(await call()).toEqual(answer);
    expect(api.calls[0]!.method).toBe(httpMethod);
    expect(api.calls[0]!.url.pathname).toBe(`/v1${path}`);
    expect(api.calls[0]!.body).toEqual(params);
  });

  test('withResponse returns the answer and the response', async () => {
    api.reply(() => json(200, answer));
    const { data, response } = await call().withResponse();
    expect(data).toEqual(answer);
    expect(response.status).toBe(200);
  });

  test.each(['await', 'withResponse', 'asResponse'] as const)(
    'a 404 without a code throws FolderScopeNotAppliedError on %s',
    async (read) => {
      api.reply(() => json(404, { detail: 'Not Found' }));
      const promise = call();
      const pending =
        read === 'await' ? promise
        : read === 'withResponse' ? promise.withResponse()
        : promise.asResponse();
      const error = await pending.catch((e: unknown) => e);
      expect(error).toBeInstanceOf(FolderScopeNotAppliedError);
      expect(error.parameter).toBe(`${httpMethod} ${path}`);
    },
  );

  test('a 404 with an empty code is a missing route', async () => {
    api.reply(() => json(404, { detail: 'Not Found', code: '' }));
    await expect(call()).rejects.toBeInstanceOf(FolderScopeNotAppliedError);
  });

  test('a 404 with a code stays a NotFoundError', async () => {
    api.reply(() => json(404, { detail: 'No such folder.', code: 'folder.not_found' }));
    const error = await call().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.error.code).toBe('folder.not_found');
  });
});

describe('retries of the folder methods', () => {
  const unavailable = () =>
    json(
      503,
      { detail: 'Temporarily unavailable', code: 'service.unavailable' },
      { 'x-should-retry': 'true', 'retry-after': '0' },
    );

  test.each([
    ['renameFolder', { folder: 'A', new_folder: 'B' }],
    ['removeFolder', { folder: 'A' }],
    ['deleteFolder', { folder: 'A' }],
  ] as const)('%s never retries a 503, also against a per-call maxRetries', async (method, params) => {
    api.fallback = unavailable;
    const sources = client({ maxRetries: 3 }).sources as any;
    await expect(sources[method](params)).rejects.toBeInstanceOf(InternalServerError);
    expect(api.calls).toHaveLength(1);
    await expect(sources[method](params, { maxRetries: 5 })).rejects.toBeInstanceOf(InternalServerError);
    expect(api.calls).toHaveLength(2);
  });

  test.each([
    ['renameFolder', { folder: 'A', new_folder: 'B' }],
    ['removeFolder', { folder: 'A' }],
    ['deleteFolder', { folder: 'A' }],
  ] as const)('%s never retries a connection error', async (method, params) => {
    const fetch = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const sources = new Graphor({ apiKey: 'k', baseURL: BASE_URL, fetch: fetch as any, maxRetries: 3 })
      .sources as any;
    await expect(sources[method](params, { maxRetries: 4 })).rejects.toBeInstanceOf(APIError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('createFolder keeps the client retries', async () => {
    api.fallback = unavailable;
    await expect(client({ maxRetries: 2 }).sources.createFolder({ folder: 'A' })).rejects.toBeInstanceOf(
      InternalServerError,
    );
    expect(api.calls).toHaveLength(3);
  });
});

describe('links with a folder', () => {
  test.each([
    ['ingestURL', '/sources/ingest-url'],
    ['ingestGitHub', '/sources/ingest-github'],
    ['ingestYoutube', '/sources/ingest-youtube'],
  ] as const)('%s sends folder as given, "" and null included', async (method, path) => {
    const sources = client().sources as any;
    for (const folder of ['Contracts', '', '/', null]) {
      api.reply(() => json(200, { build_id: 'b' }));
      await sources[method]({ url: 'https://example.test', folder });
      const sent = api.calls[api.calls.length - 1]!;
      expect(sent.url.pathname).toBe(`/v1${path}`);
      expect(sent.body).toEqual({ url: 'https://example.test', folder });
    }
    api.reply(() => json(200, { build_id: 'b' }));
    await sources[method]({ url: 'https://example.test' });
    expect('folder' in api.calls[api.calls.length - 1]!.body).toBe(false);
  });
});
