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
      'Returns every source with file metadata (ID, name, size, type, origin) ' +
      'and its current processing status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: Graphor) => {
    const result = await client.sources.list();
    return asTextContentResult(result);
  },
};

export default tool;
