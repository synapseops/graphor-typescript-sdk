import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['build', 'status', 'ingest'],
    httpMethod: 'get',
    httpPath: '/sources/builds/{build_id}',
  },
  tool: {
    name: 'get_build_status',
    description:
      'Check the status of an async ingestion or reprocess operation. ' +
      'Pass the build_id returned by ingest_file, ingest_url, ingest_github, ingest_youtube, or reprocess.\n\n' +
      'When the build completes successfully, the response includes:\n' +
      '- **success: true** — the build finished without errors\n' +
      '- **file_id** — use this in subsequent calls (ask, extract, retrieve_chunks, get_elements, delete_source, reprocess)\n' +
      '- **file_name** — display name of the source\n' +
      '- **status** — e.g. "Completed", "Processing", "Processing failed"\n\n' +
      'When the build is still in progress or the ID is not yet found, success is false and status is "not_found" or "Processing".\n\n' +
      'Typical polling loop: call this tool every 2–5 seconds until success is true.',
    inputSchema: {
      type: 'object',
      properties: {
        build_id: {
          type: 'string',
          description: 'The build identifier returned by any ingest or reprocess operation.',
        },
        suppress_elements: {
          type: 'boolean',
          description:
            'When true, parsed elements are omitted from the response (faster). ' +
            'Default: false (elements are included when the build has completed).',
        },
        suppress_img_base64: {
          type: 'boolean',
          description:
            'When true, the img_base64 field is omitted from each element. Useful to reduce payload size.',
        },
        page: {
          type: 'number',
          description: '1-based page number for paginating the elements list.',
        },
        page_size: {
          type: 'number',
          description: 'Number of elements per page (max 100).',
        },
      },
      required: ['build_id'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const buildId = args['build_id'] as string | undefined;
    if (!buildId) {
      return asErrorResult('build_id is required.');
    }

    const query: Graphor.SourceGetBuildStatusParams = {
      ...(args['suppress_elements'] != null && {
        suppress_elements: args['suppress_elements'] as boolean,
      }),
      ...(args['suppress_img_base64'] != null && {
        suppress_img_base64: args['suppress_img_base64'] as boolean,
      }),
      ...(args['page'] != null && { page: args['page'] as number }),
      ...(args['page_size'] != null && { page_size: args['page_size'] as number }),
    };

    const result = await client.sources.getBuildStatus(buildId, query);
    return asTextContentResult(result);
  },
};

export default tool;
