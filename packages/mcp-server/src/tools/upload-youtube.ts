import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['upload', 'youtube'],
    httpMethod: 'post',
    httpPath: '/sources/upload-youtube-source',
  },
  tool: {
    name: 'upload_youtube',
    description:
      'Ingest a YouTube video as a source into the knowledge graph. ' +
      'Downloads the transcript/captions, partitions the text, generates embeddings, ' +
      'and persists everything in the knowledge graph.',
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
    const result = await client.sources.uploadYoutube({ url: args.url as string });
    return asTextContentResult(result);
  },
};

export default tool;
