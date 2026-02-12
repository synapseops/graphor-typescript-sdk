# Graphor TypeScript SDK

[![NPM version](https://img.shields.io/npm/v/graphor.svg?label=npm%20(stable))](https://npmjs.org/package/graphor)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

The official TypeScript SDK for the [Graphor](https://graphorlm.com) API. Build intelligent document applications with ease.

**Features:**
- 📄 **Document Ingestion** — Upload files, web pages, GitHub repos, and YouTube videos
- 💬 **Document Chat** — Ask questions with conversational memory
- 📊 **Structured Extraction** — Extract data using JSON Schema
- 🔍 **Semantic Search** — Retrieve relevant chunks for custom RAG pipelines
- 🔒 **Type Safety** — Complete TypeScript definitions for all params and responses
- 🌐 **Multi-Runtime** — Works in Node.js, Deno, Bun, and browsers

## MCP Server

Use the Graphor MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=graphor-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdyYXBob3ItbWNwIl0sImVudiI6eyJHUkFQSE9SX0FQSV9LRVkiOiJNeSBBUEkgS2V5In19)
[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22graphor-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22graphor-mcp%22%5D%2C%22env%22%3A%7B%22GRAPHOR_API_KEY%22%3A%22My%20API%20Key%22%7D%7D)

> Note: You may need to set environment variables in your MCP client.

### Remote MCP Server (Web Apps & Agentic Workflows)

For web-based AI clients (e.g. [Claude.ai](https://claude.ai)) or agentic frameworks (e.g. LangChain, CrewAI) that cannot run local `npx` processes, use the hosted remote MCP server. Authentication is handled via **OAuth** — a browser window will open for you to log in.

```
https://mcp.graphor.workers.dev/sse
```

**Web apps (e.g. Claude.ai)** — in Claude.ai, go to **Settings > Connectors > Add custom connector**, fill in the name and the remote MCP server URL. You will be redirected to log in through the OAuth flow:

```
https://mcp.graphor.workers.dev/sse
```

**Desktop clients (e.g. Claude Desktop)** — use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as a local proxy:

```json
{
  "mcpServers": {
    "graphor_api": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.graphor.workers.dev/sse"]
    }
  }
}
```

**Agentic workflows (e.g. LangChain)** — connect via SSE transport:

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  graphor: {
    url: "https://mcp.graphor.workers.dev/sse",
    transport: "sse",
  }
});

const tools = await client.getTools();
// Use tools with your LangChain agent
```

See the [MCP Server README](./packages/mcp-server/README.md) for more details.

## Documentation

📚 **Full documentation**: [docs.graphorlm.com/sdk/overview](https://docs.graphorlm.com/sdk/overview)

## Installation

```bash
npm install graphor
```

Or with your preferred package manager:

```bash
yarn add graphor
pnpm add graphor
```

## Quick Start

```typescript
import Graphor from 'graphor';
import fs from 'fs';

const client = new Graphor();  // Uses GRAPHOR_API_KEY env var

// Upload a document
const source = await client.sources.upload({ file: fs.createReadStream('document.pdf') });
console.log(`Uploaded: ${source.file_name}`);

// Ask questions about your documents
const response = await client.sources.ask({ question: 'What are the main topics?' });
console.log(`Answer: ${response.answer}`);
```

## Authentication

Set your API key as an environment variable (recommended):

```bash
export GRAPHOR_API_KEY="grlm_your_api_key_here"
```

```typescript
import Graphor from 'graphor';

const client = new Graphor();  // Automatically uses GRAPHOR_API_KEY
```

Or pass it directly:

```typescript
const client = new Graphor({ apiKey: 'grlm_your_api_key_here' });
```

## Core Features

### 📄 Upload Documents

Upload files, web pages, GitHub repositories, or YouTube videos:

```typescript
import Graphor from 'graphor';
import fs from 'fs';

const client = new Graphor();

// Upload a local file
const source = await client.sources.upload({ file: fs.createReadStream('report.pdf') });

// Upload from URL
const urlSource = await client.sources.uploadUrl({ url: 'https://example.com/article' });

// Upload from GitHub
const githubSource = await client.sources.uploadGithub({ url: 'https://github.com/org/repo' });

// Upload from YouTube
const youtubeSource = await client.sources.uploadYoutube({ url: 'https://youtube.com/watch?v=...' });
```

**Supported formats:** PDF, DOCX, TXT, MD, HTML, CSV, XLSX, PNG, JPG, MP3, MP4, and more.

📖 [Full upload documentation](https://docs.graphorlm.com/sdk/sources/upload)

### ⚙️ Process Documents

Reprocess documents with different OCR/parsing methods:

```typescript
// Reprocess with high-resolution parsing
const source = await client.sources.parse({
  file_name: 'document.pdf',
  partition_method: 'hi_res'  // Options: basic, hi_res, hi_res_ft, mai, graphorlm
});
```

📖 [Full processing documentation](https://docs.graphorlm.com/sdk/sources/process)

### 💬 Chat with Documents

Ask questions about your documents with conversational memory:

```typescript
// Ask a question
const response = await client.sources.ask({
  question: 'What are the key findings?'
});
console.log(response.answer);

// Follow-up question (maintains context)
const followUp = await client.sources.ask({
  question: 'Can you elaborate on the first point?',
  conversation_id: response.conversation_id
});
console.log(followUp.answer);

// Scope to specific documents
const scopedResponse = await client.sources.ask({
  question: 'Compare these two reports',
  file_names: ['report-2023.pdf', 'report-2024.pdf']
});
```

📖 [Full chat documentation](https://docs.graphorlm.com/sdk/chat)

### 📊 Extract Structured Data

Extract structured information using JSON Schema:

```typescript
const result = await client.sources.extract({
  file_names: ['invoice.pdf'],
  user_instruction: 'Extract invoice details',
  output_schema: {
    type: 'object',
    properties: {
      invoice_number: { type: 'string' },
      total_amount: { type: 'number' },
      line_items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            amount: { type: 'number' }
          }
        }
      }
    }
  }
});

console.log(result.structured_output);
// { invoice_number: "INV-001", total_amount: 1500.00, line_items: [...] }
```

📖 [Full extraction documentation](https://docs.graphorlm.com/sdk/extract)

### 🔍 Retrieve Chunks (Prebuilt RAG)

Build custom RAG pipelines with semantic search:

```typescript
// Retrieve relevant chunks
const result = await client.sources.retrieveChunks({
  query: 'What are the payment terms?'
});

for (const chunk of result.chunks) {
  console.log(`[${chunk.file_name}, Page ${chunk.page_number}]`);
  console.log(`Score: ${chunk.score.toFixed(2)}`);
  console.log(chunk.text);
  console.log('---');
}

// Use with your preferred LLM
const context = result.chunks.map(c => c.text).join('\n');
// Pass context to OpenAI, Anthropic, etc.
```

📖 [Full RAG documentation](https://docs.graphorlm.com/sdk/prebuilt-rag)

### 📋 Manage Sources

List, inspect, and delete documents:

```typescript
// List all sources
const sources = await client.sources.list();
for (const source of sources) {
  console.log(`${source.file_name}: ${source.status}`);
}

// Get document elements
const elements = await client.sources.loadElements({
  file_name: 'document.pdf',
  page: 1,
  page_size: 50
});

// Delete a source
const result = await client.sources.delete({ file_name: 'document.pdf' });
```

## File Uploads

Request parameters that correspond to file uploads can be passed in many different forms:

```typescript
import fs from 'fs';
import Graphor, { toFile } from 'graphor';

const client = new Graphor();

// Using fs.createReadStream (Node.js)
await client.sources.upload({ file: fs.createReadStream('/path/to/file') });

// Using File API (browsers)
await client.sources.upload({ file: new File(['my bytes'], 'file') });

// Using fetch Response
await client.sources.upload({ file: await fetch('https://somesite/file') });

// Using toFile helper
await client.sources.upload({ file: await toFile(Buffer.from('my bytes'), 'file') });
```

## Error Handling

```typescript
import Graphor from 'graphor';

const client = new Graphor();

try {
  const response = await client.sources.ask({ question: 'What is this about?' });
} catch (err) {
  if (err instanceof Graphor.BadRequestError) {
    console.log('Bad request');
  } else if (err instanceof Graphor.AuthenticationError) {
    console.log('Invalid API key');
  } else if (err instanceof Graphor.NotFoundError) {
    console.log('Resource not found');
  } else if (err instanceof Graphor.RateLimitError) {
    console.log('Rate limited - back off and retry');
  } else if (err instanceof Graphor.APIConnectionError) {
    console.log('Network error');
  } else if (err instanceof Graphor.APIError) {
    console.log(`API error: ${err.status}`);
  } else {
    throw err;
  }
}
```

| Status Code | Error Type |
|-------------|------------|
| 400 | `BadRequestError` |
| 401 | `AuthenticationError` |
| 403 | `PermissionDeniedError` |
| 404 | `NotFoundError` |
| 422 | `UnprocessableEntityError` |
| 429 | `RateLimitError` |
| ≥500 | `InternalServerError` |
| N/A | `APIConnectionError` |

## Configuration

### Retries

Requests are automatically retried twice with exponential backoff:

```typescript
// Configure default retries
const client = new Graphor({ maxRetries: 5 });

// Or per-request
await client.sources.ask({ question: '...' }, { maxRetries: 3 });
```

### Timeouts

Default timeout is 60 seconds:

```typescript
// Configure default timeout (in milliseconds)
const client = new Graphor({ timeout: 120 * 1000 });

// Or per-request
await client.sources.parse(
  { file_name: 'large-document.pdf', partition_method: 'graphorlm' },
  { timeout: 300 * 1000 }
);
```

## Complete Example

```typescript
import Graphor from 'graphor';
import fs from 'fs';

const client = new Graphor();

// 1. Upload a document
const source = await client.sources.upload({ file: fs.createReadStream('contract.pdf') });
console.log(`✅ Uploaded: ${source.file_name}`);

// 2. Process with advanced parsing
const processed = await client.sources.parse({
  file_name: source.file_name,
  partition_method: 'hi_res'
});
console.log(`✅ Processed: ${processed.status}`);

// 3. Ask questions
const response = await client.sources.ask({
  question: 'What are the key terms of this contract?',
  file_names: [source.file_name]
});
console.log(`📝 Answer: ${response.answer}`);

// 4. Extract structured data
const extracted = await client.sources.extract({
  file_names: [source.file_name],
  user_instruction: 'Extract contract details',
  output_schema: {
    type: 'object',
    properties: {
      parties: { type: 'array', items: { type: 'string' } },
      effective_date: { type: 'string' },
      termination_date: { type: 'string' },
      total_value: { type: 'number' }
    }
  }
});
console.log(`📊 Extracted: ${JSON.stringify(extracted.structured_output)}`);

// 5. Build custom RAG
const chunks = await client.sources.retrieveChunks({
  query: 'payment obligations',
  file_names: [source.file_name]
});
console.log(`🔍 Found ${chunks.total} relevant chunks`);
```

## API Reference

### Sources

| Method | Description | Docs |
|--------|-------------|------|
| `sources.upload()` | Upload a local file | [📖](https://docs.graphorlm.com/sdk/sources/upload#upload-a-file) |
| `sources.uploadUrl()` | Upload from web URL | [📖](https://docs.graphorlm.com/sdk/sources/upload#upload-from-url) |
| `sources.uploadGithub()` | Upload from GitHub | [📖](https://docs.graphorlm.com/sdk/sources/upload#upload-from-github) |
| `sources.uploadYoutube()` | Upload from YouTube | [📖](https://docs.graphorlm.com/sdk/sources/upload#upload-from-youtube) |
| `sources.parse()` | Reprocess with different method | [📖](https://docs.graphorlm.com/sdk/sources/process) |
| `sources.list()` | List all sources | [📖](https://docs.graphorlm.com/sdk/sources/list) |
| `sources.delete()` | Delete a source | [📖](https://docs.graphorlm.com/sdk/sources/delete) |
| `sources.loadElements()` | Get parsed elements | [📖](https://docs.graphorlm.com/sdk/sources/list-elements) |

### Chat & AI

| Method | Description | Docs |
|--------|-------------|------|
| `sources.ask()` | Ask questions about documents | [📖](https://docs.graphorlm.com/sdk/chat) |
| `sources.extract()` | Extract structured data | [📖](https://docs.graphorlm.com/sdk/extract) |
| `sources.retrieveChunks()` | Retrieve chunks for RAG | [📖](https://docs.graphorlm.com/sdk/prebuilt-rag) |

## TypeScript Support

This library includes complete TypeScript definitions for all request params and response fields:

```typescript
import Graphor from 'graphor';

const client = new Graphor();

// Type-safe params and responses
const params: Graphor.SourceUploadParams = { file: fs.createReadStream('path/to/file') };
const source: Graphor.PublicSource = await client.sources.upload(params);
```

Documentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.

## Requirements

- TypeScript >= 4.9
- Node.js 20+ (LTS)
- Also works in: Deno v1.28+, Bun 1.0+, Cloudflare Workers, Vercel Edge Runtime, and modern browsers

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- 📚 [Documentation](https://docs.graphorlm.com/sdk/overview)
- 🐛 [Issue Tracker](https://github.com/synapseops/graphor-typescript-sdk/issues)
- 📦 [NPM](https://www.npmjs.com/package/graphor)
- 🏠 [Graphor](https://graphorlm.com)
