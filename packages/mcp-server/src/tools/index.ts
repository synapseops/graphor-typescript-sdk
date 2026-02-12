import type { McpTool } from '../types';

import askTool from './ask';
import extractTool from './extract';
import retrieveChunksTool from './retrieve-chunks';
import uploadFileTool from './upload-file';
import uploadUrlTool from './upload-url';
import uploadGithubTool from './upload-github';
import uploadYoutubeTool from './upload-youtube';
import listSourcesTool from './list-sources';
import deleteSourceTool from './delete-source';
import parseTool from './parse';
import loadElementsTool from './load-elements';

export {
  askTool,
  extractTool,
  retrieveChunksTool,
  uploadFileTool,
  uploadUrlTool,
  uploadGithubTool,
  uploadYoutubeTool,
  listSourcesTool,
  deleteSourceTool,
  parseTool,
  loadElementsTool,
};

export const allTools: McpTool[] = [
  askTool,
  extractTool,
  retrieveChunksTool,
  uploadFileTool,
  uploadUrlTool,
  uploadGithubTool,
  uploadYoutubeTool,
  listSourcesTool,
  deleteSourceTool,
  parseTool,
  loadElementsTool,
];
