import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import { withFolderCheck } from '../folders';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['folders', 'list'],
    httpMethod: 'get',
    httpPath: '/sources/folders',
  },
  tool: {
    name: 'list_folders',
    description:
      'List every folder of the project, sorted: folders created empty, folders that hold sources and folders ' +
      'uploads are on their way to, each with the folders above it. A folder is a "/"-separated path such as ' +
      '"Contracts/2026"; the top level ("") is not listed. At most 10,000 folders are returned; truncated is true ' +
      'when the project has more.\n\n' +
      'Use a folder with list_sources (folder), ask, extract and retrieve_chunks (folders), the ingest tools ' +
      '(folder) and move_sources.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: Graphor) =>
    withFolderCheck(async () => asTextContentResult(await client.sources.listFolders())),
};

export default tool;
