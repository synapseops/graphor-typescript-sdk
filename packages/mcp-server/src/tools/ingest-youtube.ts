import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['ingest', 'youtube'],
    httpMethod: 'post',
    httpPath: '/sources/ingest-youtube',
  },
  tool: {
    name: 'ingest_youtube',
    description:
      'Ingest a public YouTube video as a source into the knowledge graph. ' +
      'Downloads the transcript/captions, partitions the text, generates embeddings, ' +
      'and persists everything in the knowledge graph.\n\n' +
      'Returns a build_id immediately — use get_build_status to poll until processing completes ' +
      'and obtain the file_id for subsequent calls.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The YouTube video URL to ingest (e.g. https://www.youtube.com/watch?v=...).',
        },
      },
      required: ['url'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const result = await client.sources.ingestYoutube({ url: args['url'] as string });
    return asTextContentResult(result);
  },
};

export default tool;
