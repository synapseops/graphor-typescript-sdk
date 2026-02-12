import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['upload', 'github'],
    httpMethod: 'post',
    httpPath: '/sources/upload-github-source',
  },
  tool: {
    name: 'upload_github',
    description:
      'Ingest a GitHub repository as a source into the knowledge graph. ' +
      'Clones the repository, extracts text-based files, partitions, generates embeddings, ' +
      'and persists everything in the knowledge graph.',
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
    const result = await client.sources.uploadGitHub({ url: args.url as string });
    return asTextContentResult(result);
  },
};

export default tool;
