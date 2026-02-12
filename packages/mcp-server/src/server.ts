import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  SetLevelRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ClientOptions } from 'graphor';
import Graphor from 'graphor';
import { allTools } from './tools';
import { HandlerFunction, McpTool } from './types';

export { ClientOptions } from 'graphor';

function getInstructions(): string {
  return `The current time in Unix timestamps is ${Date.now()}.

 # Graphor TypeScript SDK Guide

## What is Graphor?

Graphor is a document intelligence platform that ingests files, web pages, GitHub repos, and YouTube videos into a knowledge graph. The SDK provides conversational Q&A, structured data extraction, and semantic search over your ingested documents.

## Core Capabilities

- **Multi-source ingestion**: Upload PDFs, DOCX, images, audio, video, web pages, GitHub repos, and YouTube videos
- **Conversational chat**: Ask questions with memory across conversation turns
- **Structured extraction**: Extract typed data using JSON Schema validation
- **Semantic search**: Retrieve relevant chunks for custom RAG pipelines

---

## Common Use Cases

### 1. Upload & Chat with Documents

Upload a file using the \`upload_file\` tool, then ask questions using the \`ask\` tool.
Pass \`conversation_id\` from the response to maintain context across multiple turns.

### 2. Extract Structured Data

Use the \`extract\` tool with a \`user_instruction\` describing what to extract and an \`output_schema\` (JSON Schema) defining the desired shape.

### 3. Semantic Search (Custom RAG)

Use the \`retrieve_chunks\` tool to find relevant text chunks without generating an answer.

### 4. Upload from External Sources

- Web pages: use \`upload_url\` (set \`crawlUrls: true\` to follow links)
- GitHub repos: use \`upload_github\`
- YouTube videos: use \`upload_youtube\`

### 5. Manage Documents

- List all sources: \`list_sources\`
- Delete a source: \`delete_source\`
- Re-parse with different strategy: \`parse\`
- Inspect parsed chunks: \`load_elements\`

---

## Special Features

**Conversation Memory**: Pass \`conversation_id\` from a previous \`ask\` response to maintain context across multiple turns.

**Scoped Queries**: Use \`file_names\` or \`file_ids\` in \`ask\`, \`extract\`, and \`retrieve_chunks\` to restrict searches to specific documents.

**Thinking Levels**: Control cost/speed with \`thinking_level: "fast" | "balanced" | "accurate"\` in \`ask\` and \`extract\`.

**File Upload Modes**: The \`upload_file\` tool supports two modes:
- \`file_path\`: Provide an absolute path to a local file (works in local/stdio MCP).
- \`file_content\` + \`file_name\`: Provide text content directly (works in both local and remote MCP; best for text files like .md, .txt, .csv, .html).
For binary files (PDF, DOCX, images, etc.), use \`file_path\`.

**Binary file upload fallback**: If \`file_path\` is not available (e.g. remote MCP on Cloudflare) and the file is binary, you can upload it directly via curl in the user's terminal:
\`\`\`
curl -s -X POST "{base_url}/source/upload" \\
  -H "Authorization: Bearer {api_key}" \\
  -F "file=@/path/to/document.pdf" \\
  -F "partition_method=graphorlm"
\`\`\`
Use the GRAPHOR_BASE_URL and GRAPHOR_API_KEY environment variables for the base_url and api_key values.

---

## Method Reference

| Tool | Description |
|------|-------------|
| \`ask\` | Ask questions grounded on ingested sources |
| \`extract\` | Extract structured data using JSON Schema |
| \`retrieve_chunks\` | Semantic search for relevant chunks |
| \`upload_file\` | Upload a local file |
| \`upload_url\` | Ingest a web page |
| \`upload_github\` | Ingest a GitHub repository |
| \`upload_youtube\` | Ingest a YouTube video |
| \`list_sources\` | List all ingested sources |
| \`delete_source\` | Delete a source |
| \`parse\` | Re-process a source with a different strategy |
| \`load_elements\` | Get parsed elements/chunks of a source |
`;
}

export const newMcpServer = async () =>
  new McpServer(
    {
      name: 'graphor_api',
      version: '0.11.4',
    },
    {
      instructions: getInstructions(),
      capabilities: { tools: {}, logging: {} },
    },
  );

/**
 * Initializes the provided MCP Server with the given tools and handlers.
 * If not provided, the default client, tools and handlers will be used.
 */
export async function initMcpServer(params: { server: Server | McpServer; clientOptions?: ClientOptions }) {
  const server = params.server instanceof McpServer ? params.server.server : params.server;

  const logAtLevel =
    (level: 'debug' | 'info' | 'warning' | 'error') =>
    (message: string, ...rest: unknown[]) => {
      void server.sendLoggingMessage({
        level,
        data: { message, rest },
      });
    };
  const logger = {
    debug: logAtLevel('debug'),
    info: logAtLevel('info'),
    warn: logAtLevel('warning'),
    error: logAtLevel('error'),
  };

  let client = new Graphor({
    logger,
    ...params.clientOptions,
    defaultHeaders: {
      ...params.clientOptions?.defaultHeaders,
    },
  });

  const providedTools = selectTools();
  const toolMap = Object.fromEntries(providedTools.map((mcpTool) => [mcpTool.tool.name, mcpTool]));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: providedTools.map((mcpTool) => mcpTool.tool),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const mcpTool = toolMap[name];
    if (!mcpTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return executeHandler(mcpTool.handler, client, args);
  });

  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params;
    switch (level) {
      case 'debug':
        client = client.withOptions({ logLevel: 'debug' });
        break;
      case 'info':
        client = client.withOptions({ logLevel: 'info' });
        break;
      case 'notice':
      case 'warning':
        client = client.withOptions({ logLevel: 'warn' });
        break;
      case 'error':
        client = client.withOptions({ logLevel: 'error' });
        break;
      default:
        client = client.withOptions({ logLevel: 'off' });
        break;
    }
    return {};
  });
}

/**
 * Returns all available tools for the MCP Server.
 */
export function selectTools(): McpTool[] {
  return [...allTools];
}

/**
 * Runs the provided handler with the given client and arguments.
 */
export async function executeHandler(
  handler: HandlerFunction,
  client: Graphor,
  args: Record<string, unknown> | undefined,
) {
  return await handler(client, args || {});
}

export const readEnv = (env: string): string | undefined => {
  if (typeof (globalThis as any).process !== 'undefined') {
    return (globalThis as any).process.env?.[env]?.trim();
  } else if (typeof (globalThis as any).Deno !== 'undefined') {
    return (globalThis as any).Deno.env?.get?.(env)?.trim();
  }
  return;
};

export const readEnvOrError = (env: string): string => {
  let envValue = readEnv(env);
  if (envValue === undefined) {
    throw new Error(`Environment variable ${env} is not set`);
  }
  return envValue;
};

export const requireValue = <T>(value: T | undefined, description: string): T => {
  if (value === undefined) {
    throw new Error(`Missing required value: ${description}`);
  }
  return value;
};
