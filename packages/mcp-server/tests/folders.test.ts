import Graphor from 'graphor';
import { allTools } from '../src/tools';
import { isTopLevelFolder } from '../src/folders';

const tool = (name: string) => {
  const found = allTools.find((t) => t.tool.name === name);
  if (!found) throw new Error(`no tool ${name}`);
  return found;
};

/** A client whose source methods record their parameters. */
function recordingClient() {
  const calls: Record<string, any[]> = {};
  const record =
    (name: string, result: unknown = {}) =>
    async (params?: unknown) => {
      (calls[name] ??= []).push(params);
      return result;
    };
  const sources = {
    list: record('list', []),
    listFolders: record('listFolders', { folders: [], truncated: false }),
    createFolder: record('createFolder'),
    move: record('move'),
    ask: record('ask'),
    extract: record('extract'),
    retrieveChunks: record('retrieveChunks'),
    ingestURL: record('ingestURL'),
    ingestGitHub: record('ingestGitHub'),
    ingestYoutube: record('ingestYoutube'),
    ingestFile: record('ingestFile'),
  };
  return { client: { sources } as unknown as Graphor, calls };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function fakeApiClient(reply: () => Response): Graphor {
  return new Graphor({
    apiKey: 'test-key',
    baseURL: 'https://api.example.test/v1',
    fetch: (async () => reply()) as any,
  });
}

describe('the folder tools', () => {
  test('list_folders, create_folder and move_sources are registered', () => {
    const names = allTools.map((t) => t.tool.name);
    expect(names).toEqual(expect.arrayContaining(['list_folders', 'create_folder', 'move_sources']));
    expect(names).not.toEqual(expect.arrayContaining(['rename_folder']));
    expect(names).not.toEqual(expect.arrayContaining(['remove_folder']));
    expect(names).not.toEqual(expect.arrayContaining(['delete_folder']));
  });

  test('their input schemas', () => {
    expect(tool('list_folders').tool.inputSchema.properties).toEqual({});
    expect(tool('create_folder').tool.inputSchema.required).toEqual(['folder']);
    expect(tool('move_sources').tool.inputSchema.required).toEqual(['file_ids', 'folder']);
  });

  test.each([
    ['list_sources', ['folder', 'recursive']],
    ['ingest_file', ['folder']],
    ['ingest_url', ['folder']],
    ['ingest_github', ['folder']],
    ['ingest_youtube', ['folder']],
    ['ask', ['folders']],
    ['extract', ['folders']],
    ['retrieve_chunks', ['folders']],
  ])('%s takes %j', (name, inputs) => {
    const properties = tool(name).tool.inputSchema.properties as Record<string, unknown>;
    for (const input of inputs) expect(properties[input]).toBeDefined();
  });

  test('move_sources passes "" through as the top level', async () => {
    const { client, calls } = recordingClient();
    await tool('move_sources').handler(client, { file_ids: ['f1'], folder: '' });
    expect(calls['move']).toEqual([{ file_ids: ['f1'], folder: '' }]);
  });

  test('create_folder passes the folder', async () => {
    const { client, calls } = recordingClient();
    await tool('create_folder').handler(client, { folder: 'Contracts/2026' });
    expect(calls['createFolder']).toEqual([{ folder: 'Contracts/2026' }]);
  });
});

describe('list_sources and the top level', () => {
  test.each(['', '/', ' ', '//', ' / '])('folder %j lists the top level only', async (folder) => {
    for (const recursive of [undefined, true, false]) {
      const { client, calls } = recordingClient();
      await tool('list_sources').handler(client, { folder, ...(recursive !== undefined && { recursive }) });
      expect(calls['list']).toEqual([{ recursive: false }]);
    }
  });

  test.each(['\t', '\n', ' ', '　'])('folder %j is passed as given', async (folder) => {
    const { client, calls } = recordingClient();
    await tool('list_sources').handler(client, { folder });
    expect(calls['list']).toEqual([{ folder }]);
  });

  test('a path and recursive are passed', async () => {
    const { client, calls } = recordingClient();
    await tool('list_sources').handler(client, { folder: 'Contracts', recursive: false, file_ids: ['f1'] });
    expect(calls['list']).toEqual([{ file_ids: ['f1'], folder: 'Contracts', recursive: false }]);
  });

  test('no folder sends none', async () => {
    const { client, calls } = recordingClient();
    await tool('list_sources').handler(client, {});
    expect(calls['list']).toEqual([{}]);
  });

  test('the top-level test is spaces and slashes only', () => {
    expect(['', '/', ' ', '//', ' / '].every(isTopLevelFolder)).toBe(true);
    expect(['\t', '\n', ' ', '　', 'a', ' a/'].some(isTopLevelFolder)).toBe(false);
  });
});

describe('folder inputs on the other tools', () => {
  test.each([
    ['ingest_url', 'ingestURL'],
    ['ingest_github', 'ingestGitHub'],
    ['ingest_youtube', 'ingestYoutube'],
  ])('%s passes folder as given, "" included, and omits it when not sent', async (name, method) => {
    for (const folder of ['Contracts', '', '/']) {
      const { client, calls } = recordingClient();
      await tool(name).handler(client, { url: 'https://example.test', folder });
      expect(calls[method]![0].folder).toBe(folder);
    }
    const { client, calls } = recordingClient();
    await tool(name).handler(client, { url: 'https://example.test' });
    expect('folder' in calls[method]![0]).toBe(false);
  });

  test('ingest_file passes folder', async () => {
    const { client, calls } = recordingClient();
    await tool('ingest_file').handler(client, { file_content: 'hi', file_name: 'a.md', folder: '' });
    expect(calls['ingestFile']![0].folder).toBe('');
  });

  test.each([
    ['ask', 'ask', { question: 'q' }],
    ['extract', 'extract', { user_instruction: 'u', output_schema: {} }],
    ['retrieve_chunks', 'retrieveChunks', { query: 'q' }],
  ])('%s passes folders', async (name, method, required) => {
    const { client, calls } = recordingClient();
    await tool(name).handler(client, { ...required, folders: ['Contracts'] });
    expect(calls[method]![0].folders).toEqual(['Contracts']);
  });
});

describe('a folders that is not an array of strings', () => {
  test.each([
    ['ask', 'ask', { question: 'q' }],
    ['extract', 'extract', { user_instruction: 'u', output_schema: {} }],
    ['retrieve_chunks', 'retrieveChunks', { query: 'q' }],
  ])('%s refuses it without a call', async (name, method, required) => {
    for (const folders of ['Contracts', [1], { a: 'b' }]) {
      const { client, calls } = recordingClient();
      const result = await tool(name).handler(client, { ...required, folders });
      expect(result.isError).toBe(true);
      expect(calls[method]).toBeUndefined();
    }
  });
});

describe('a folder parameter the API did not apply', () => {
  test('list_sources returns an error, not the sources', async () => {
    const client = fakeApiClient(() => json(200, [{ file_id: 'f1', file_name: 'a.pdf' }]));
    const result = await tool('list_sources').handler(client, { folder: 'Contracts' });
    expect(result.isError).toBe(true);
    expect(result.content[0]).toMatchObject({ type: 'text' });
    expect(JSON.stringify(result.content)).not.toContain('a.pdf');
  });

  test('ask returns an error naming the conversation to reset', async () => {
    const client = fakeApiClient(() => json(200, { answer: 'secret answer', conversation_id: 'conv-1' }));
    const result = await tool('ask').handler(client, { question: 'q', folders: ['Contracts'] });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('conv-1');
    expect(text).toContain('reset');
    expect(text).not.toContain('secret answer');
  });

  test('list_folders on an API without folders returns an error', async () => {
    const client = fakeApiClient(() => json(404, { detail: 'Not Found' }));
    const result = await tool('list_folders').handler(client, {});
    expect(result.isError).toBe(true);
  });

  test('a scoped answer with the echo is returned', async () => {
    const client = fakeApiClient(() => json(200, { answer: 'ok', folders: ['Contracts'] }));
    const result = await tool('ask').handler(client, { question: 'q', folders: ['Contracts'] });
    expect(result.isError).toBeUndefined();
  });
});
