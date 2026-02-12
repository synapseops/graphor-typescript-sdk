import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

/**
 * Try to dynamically import 'fs' and 'path' modules.
 * These are available in Node.js (local MCP) but not in Cloudflare Workers (remote MCP).
 */
async function tryReadFileFromPath(filePath: string): Promise<{ stream: any; fileName: string } | null> {
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');

    if (!fs.existsSync(filePath)) {
      return null;
    }

    return {
      stream: fs.createReadStream(filePath),
      fileName: path.basename(filePath),
    };
  } catch {
    // fs/path not available (e.g. Cloudflare Workers)
    return null;
  }
}

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['upload', 'file'],
    httpMethod: 'post',
    httpPath: '/sources/upload',
  },
  tool: {
    name: 'upload_file',
    description:
      'Upload a local file and ingest it as a source into the knowledge graph. ' +
      'Supports two modes:\n' +
      '1. **file_path** — provide an absolute path to a file on the local filesystem (works in local/stdio MCP).\n' +
      '2. **file_content** + **file_name** — provide the file content as a string and a file name ' +
      '(works in both local and remote MCP; suitable for text-based files like .md, .txt, .csv, .html).\n\n' +
      'At least one mode must be used. For binary files (PDF, DOCX, images, etc.), use file_path.\n\n' +
      'Supported file types: pdf, doc, docx, odt, ppt, pptx, csv, tsv, xls, xlsx, txt, text, ' +
      'md, html, htm, png, jpg, jpeg, tiff, bmp, heic, mp4, mov, avi, mkv, webm, mp3, wav, m4a, ogg, flac.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path to a file on the local filesystem.',
        },
        file_content: {
          type: 'string',
          description:
            'The text content of the file. Use this for text-based files (md, txt, csv, html, etc.).',
        },
        file_name: {
          type: 'string',
          description:
            'The file name including extension (e.g. "report.md"). Required when using file_content.',
        },
        partition_method: {
          type: 'string',
          enum: ['basic', 'hi_res', 'hi_res_ft', 'mai', 'graphorlm'],
          description: 'The partitioning strategy to apply. When omitted, the system default is used.',
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const filePath = args['file_path'] as string | undefined;
    const fileContent = args['file_content'] as string | undefined;
    const fileName = args['file_name'] as string | undefined;
    const partitionMethod = args['partition_method'] as
      | Graphor.SourceUploadParams['partition_method']
      | undefined;

    let uploadFile: any;

    if (filePath) {
      // Mode 1: Upload from local file path
      const fileInfo = await tryReadFileFromPath(filePath);
      if (!fileInfo) {
        return asErrorResult(
          `File not found or filesystem not available at path: ${filePath}. ` +
            'If running in a remote MCP environment (e.g. Cloudflare), use file_content + file_name instead.',
        );
      }
      uploadFile = fileInfo.stream;
    } else if (fileContent != null && fileName) {
      // Mode 2: Upload from in-memory content
      uploadFile = new File([fileContent], fileName);
    } else {
      return asErrorResult(
        'You must provide either file_path (for local files) or both file_content and file_name (for text content).',
      );
    }

    const params: Graphor.SourceUploadParams = {
      file: uploadFile,
      ...(partitionMethod != null && { partition_method: partitionMethod }),
    };

    const result = await client.sources.upload(params);
    return asTextContentResult(result);
  },
};

export default tool;
