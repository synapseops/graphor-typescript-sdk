import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import { withFolderCheck } from '../folders';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['folders', 'create'],
    httpMethod: 'post',
    httpPath: '/sources/create-folder',
  },
  tool: {
    name: 'create_folder',
    description:
      'Create a folder that stays listed while it is empty, with the folders above it. ' +
      'Only needed for an empty folder: uploading or moving a source into a folder creates it. ' +
      'Safe to repeat: created is false when the folder already existed. ' +
      'The top level ("" or "/") and invalid paths are refused.',
    inputSchema: {
      type: 'object',
      properties: {
        folder: {
          type: 'string',
          description: 'The folder\'s "/"-separated path, for example "Contracts/2026".',
        },
      },
      required: ['folder'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) =>
    withFolderCheck(async () =>
      asTextContentResult(await client.sources.createFolder({ folder: args['folder'] as string })),
    ),
};

export default tool;
