import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['ingest', 'github'],
    httpMethod: 'post',
    httpPath: '/sources/ingest-github',
  },
  tool: {
    name: 'ingest_github',
    description:
      'Ingest a public GitHub repository as a source into the knowledge graph. ' +
      'Clones the repository, extracts text-based files, partitions, generates embeddings, ' +
      'and persists everything in the knowledge graph.\n\n' +
      'Returns a build_id immediately — use get_build_status to poll until processing completes ' +
      'and obtain the file_id for subsequent calls.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The GitHub repository URL to ingest (e.g. https://github.com/owner/repo).',
        },
      },
      required: ['url'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const result = await client.sources.ingestGitHub({ url: args['url'] as string });
    return asTextContentResult(result);
  },
};

export default tool;
