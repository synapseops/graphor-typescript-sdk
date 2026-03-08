import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['delete'],
    httpMethod: 'delete',
    httpPath: '/sources/delete',
  },
  tool: {
    name: 'delete_source',
    description:
      "Delete a source from the project's knowledge graph and all associated data. " +
      'The operation is irreversible. Requires the file_id ' +
      '(obtain it from list_sources or get_build_status).',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier of the source to delete.',
        },
      },
      required: ['file_id'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const fileId = args['file_id'] as string | undefined;
    if (!fileId) {
      return asErrorResult('file_id is required.');
    }

    const result = await client.sources.delete({ file_id: fileId });
    return asTextContentResult(result);
  },
};

export default tool;
