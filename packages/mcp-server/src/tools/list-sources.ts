import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import { isTopLevelFolder, withFolderCheck } from '../folders';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['list'],
    httpMethod: 'get',
    httpPath: '/sources',
  },
  tool: {
    name: 'list_sources',
    description:
      "List all sources in the project's knowledge graph. " +
      'Returns every source with file metadata (file_id, name, size, type, origin, method, searchable), ' +
      'its folder ("/"-separated path; "" is the top level) and its current processing status. ' +
      'Use file_ids to filter by specific sources, and folder to list one folder: ' +
      'a path lists that folder and everything below it, recursive: false with a path lists only that folder, ' +
      'and "" (or "/") lists only the sources at the top level. ' +
      'The file_id from each result can be used in get_elements, reprocess, delete_source, ask, extract, and retrieve_chunks.',
    inputSchema: {
      type: 'object',
      properties: {
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional list of file_ids to filter results. When omitted, all sources are returned.',
        },
        folder: {
          type: 'string',
          description:
            'Only the sources in this folder ("/"-separated path) and the folders below it. ' +
            '"" or "/" lists only the sources at the top level. Use list_folders to see the folders.',
        },
        recursive: {
          type: 'boolean',
          description:
            'With folder, false lists only the sources directly in it (default true). ' +
            'Without folder, false lists only the sources at the top level.',
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: Graphor.SourceListParams = {
      ...(args['file_ids'] != null && { file_ids: args['file_ids'] as string[] }),
    };
    const folder = args['folder'];
    if (typeof folder === 'string' && isTopLevelFolder(folder)) {
      // The top level only, whatever recursive says.
      params.recursive = false;
    } else {
      if (folder != null) params.folder = folder as string;
      if (args['recursive'] != null) params.recursive = args['recursive'] as boolean;
    }

    return withFolderCheck(async () => asTextContentResult(await client.sources.list(params)));
  },
};

export default tool;
