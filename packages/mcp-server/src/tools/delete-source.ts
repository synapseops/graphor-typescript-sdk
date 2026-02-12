import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';
import type { SourceDeleteParams } from 'graphor/resources/sources';

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
      'Delete a source from the project\'s knowledge graph and all associated data. ' +
      'The operation is irreversible. Provide file_id (preferred) or file_name.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier for the source (preferred).',
        },
        file_name: {
          type: 'string',
          description: 'The display name of the file to delete.',
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    if (args.file_id == null && args.file_name == null) {
      return asErrorResult('At least one of file_id or file_name must be provided.');
    }

    const params: SourceDeleteParams = {
      ...(args.file_id != null && { file_id: args.file_id as string }),
      ...(args.file_name != null && { file_name: args.file_name as string }),
    };

    const result = await client.sources.delete(params);
    return asTextContentResult(result);
  },
};

export default tool;
