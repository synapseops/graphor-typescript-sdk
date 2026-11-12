import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import { withFolderCheck } from '../folders';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['folders', 'move'],
    httpMethod: 'post',
    httpPath: '/sources/move-sources',
  },
  tool: {
    name: 'move_sources',
    description:
      'Move up to 1,000 sources (by file_id, from list_sources) to a folder. ' +
      'folder is a "/"-separated path; "" or "/" moves them to the top level. ' +
      'A folder that does not exist is created. Ids that match no source of the project come back in not_found. ' +
      'Safe to repeat.',
    inputSchema: {
      type: 'object',
      properties: {
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'The file_ids of the sources to move (1 to 1,000).',
        },
        folder: {
          type: 'string',
          description: 'The target folder, a "/"-separated path; "" is the top level.',
        },
      },
      required: ['file_ids', 'folder'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) =>
    withFolderCheck(async () =>
      asTextContentResult(
        await client.sources.move({
          file_ids: args['file_ids'] as string[],
          // Passed as given: "" is the top level, never dropped.
          folder: args['folder'] as string,
        }),
      ),
    ),
};

export default tool;
