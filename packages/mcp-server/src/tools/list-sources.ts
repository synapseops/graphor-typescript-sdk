import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

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
      'Returns every source with file metadata (file_id, name, size, type, origin) ' +
      'and its current processing status. ' +
      'Use file_ids to filter by specific sources. ' +
      'The file_id from each result can be used in get_elements, reprocess, delete_source, ask, extract, and retrieve_chunks.',
    inputSchema: {
      type: 'object',
      properties: {
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional list of file_ids to filter results. When omitted, all sources are returned.',
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: Graphor.SourceListParams = {
      ...(args['file_ids'] != null && { file_ids: args['file_ids'] as string[] }),
    };

    const result = await client.sources.list(params);
    return asTextContentResult(result);
  },
};

export default tool;
