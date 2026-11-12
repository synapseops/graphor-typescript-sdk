import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import { FOLDERS_SCOPE_DESCRIPTION, foldersInputError, withFolderCheck } from '../folders';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['retrieval', 'rag', 'search'],
    httpMethod: 'post',
    httpPath: '/sources/prebuilt-rag',
  },
  tool: {
    name: 'retrieve_chunks',
    description:
      'Note: sources ingested with indexing="none" have no chunks and return nothing here ' +
      'until indexed via index_build (check searchable in get_build_status or list_sources).\n\n' +
      'Retrieve relevant document chunks via semantic search. ' +
      'Returns the most relevant text chunks with source metadata (file name, page number, relevance score). ' +
      'This is a pure retrieval endpoint — it does not generate an answer. Use the "ask" tool for Q&A.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The natural-language search query to find relevant chunks.',
        },
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restrict retrieval to specific source file IDs.',
        },
        file_names: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Restrict retrieval to specific source file names. Deprecated: names match exactly; prefer file_ids.',
        },
        folders: {
          type: 'array',
          items: { type: 'string' },
          description: FOLDERS_SCOPE_DESCRIPTION,
        },
      },
      required: ['query'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const invalid = foldersInputError(args);
    if (invalid) return invalid;
    const params: Graphor.SourceRetrieveChunksParams = {
      query: args['query'] as string,
      ...(args['file_ids'] != null && { file_ids: args['file_ids'] as string[] }),
      ...(args['file_names'] != null && { file_names: args['file_names'] as string[] }),
      ...(args['folders'] != null && { folders: args['folders'] as string[] }),
    };

    return withFolderCheck(async () => asTextContentResult(await client.sources.retrieveChunks(params)));
  },
};

export default tool;
