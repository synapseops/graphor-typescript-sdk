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
      'The operation is irreversible. Identify the source by file_id (preferred; from ' +
      'list_sources or get_build_status) or by file_name when the ID is not known.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier of the source to delete (preferred).',
        },
        file_name: {
          type: 'string',
          description: 'File name of the source to delete. Use when the file_id is not known.',
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const fileId = args['file_id'] as string | undefined;
    const fileName = args['file_name'] as string | undefined;
    if (!fileId && !fileName) {
      return asErrorResult('Provide file_id (preferred) or file_name.');
    }

    const result = await client.sources.delete({
      ...(fileId != null && { file_id: fileId }),
      ...(fileName != null && { file_name: fileName }),
    });
    return asTextContentResult(result);
  },
};

export default tool;
