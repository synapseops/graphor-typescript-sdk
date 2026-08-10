import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['index', 'build'],
    httpMethod: 'post',
    httpPath: '/sources/index',
  },
  tool: {
    name: 'index_build',
    description:
      'Index an existing build from its already-parsed content — without re-parsing the document. ' +
      'This is the way out of indexing="none": after ingesting or reprocessing a source without indexing, ' +
      'call this to make it searchable by ask, extract and retrieve_chunks.\n\n' +
      'Chunks, embeds and indexes the persisted partitions, makes the build the active one, and sets its ' +
      'indexing level to "full". Synchronous: the response arrives when indexing finishes.\n\n' +
      'Errors: 400 when the build is already indexed, has no partitions, is not in a settled status, or the ' +
      'deployment does not support indexing control; 404 for an unknown file or build.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier of the source file.',
        },
        build_id: {
          type: 'string',
          description:
            "Build to index. Omitted → the file's active build. When given, that build becomes " +
            'the active one (only the active build can serve retrieval).',
        },
      },
      required: ['file_id'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const fileId = args['file_id'] as string | undefined;
    if (!fileId) {
      return asErrorResult('file_id is required.');
    }

    const params: Graphor.SourceIndexBuildParams = { file_id: fileId };
    if (args['build_id'] != null) {
      params.build_id = args['build_id'] as string;
    }

    const result = await client.sources.indexBuild(params);
    return asTextContentResult(result);
  },
};

export default tool;
