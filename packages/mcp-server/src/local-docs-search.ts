// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import MiniSearch from 'minisearch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getLogger } from './logger';

type PerLanguageData = {
  method?: string;
  example?: string;
};

type MethodEntry = {
  name: string;
  endpoint: string;
  httpMethod: string;
  summary: string;
  description: string;
  stainlessPath: string;
  qualified: string;
  params?: string[];
  response?: string;
  markdown?: string;
  perLanguage?: Record<string, PerLanguageData>;
};

type ProseChunk = {
  content: string;
  tag: string;
  sectionContext?: string;
  source?: string;
};

type MiniSearchDocument = {
  id: string;
  kind: 'http_method' | 'prose';
  name?: string;
  endpoint?: string;
  summary?: string;
  description?: string;
  qualified?: string;
  stainlessPath?: string;
  content?: string;
  sectionContext?: string;
  _original: Record<string, unknown>;
};

type SearchResult = {
  results: (string | Record<string, unknown>)[];
};

const EMBEDDED_METHODS: MethodEntry[] = [
  {
    name: 'list',
    endpoint: '/sources',
    httpMethod: 'get',
    summary: 'List all sources',
    description:
      'List all sources in the project\'s knowledge graph.\n\nReturns every source node currently stored in the knowledge graph for the\nauthenticated project. Each item includes the file metadata (ID, name, size, type,\norigin) along with its current processing status and a human-readable status message.\n\n**Query parameters:**\n- **file_ids** (list, optional): If provided, only sources whose file_id is in this\n  list are returned. Repeat the param for multiple IDs (e.g. ?file_ids=id1&file_ids=id2).\n\n**Status messages returned per source:**\n- `"completed"` → *"Source processed successfully"*\n- `"processing"` → *"Source is being processed"*\n- `"failed"` → *"Source processing failed"*\n\n**Returns** a JSON array of `PublicSourceResponse` objects.\n\n**Error responses:**\n- `500` — Unexpected internal error while retrieving sources.',
    stainlessPath: '(resource) sources > (method) list',
    qualified: 'client.sources.list',
    params: ['file_ids?: string[];'],
    response:
      '{ file_name: string; file_size: number; file_source: string; file_type: string; message: string; project_id: string; project_name: string; status: string; file_id?: string; method?: string; }[]',
    markdown:
      '## list\n\n`client.sources.list(file_ids?: string[]): object[]`\n\n**get** `/sources`\n\nList all sources in the project\'s knowledge graph.\n\nReturns every source node currently stored in the knowledge graph for the\nauthenticated project. Each item includes the file metadata (ID, name, size, type,\norigin) along with its current processing status and a human-readable status message.\n\n**Query parameters:**\n- **file_ids** (list, optional): If provided, only sources whose file_id is in this\n  list are returned. Repeat the param for multiple IDs (e.g. ?file_ids=id1&file_ids=id2).\n\n**Status messages returned per source:**\n- `"completed"` → *"Source processed successfully"*\n- `"processing"` → *"Source is being processed"*\n- `"failed"` → *"Source processing failed"*\n\n**Returns** a JSON array of `PublicSourceResponse` objects.\n\n**Error responses:**\n- `500` — Unexpected internal error while retrieving sources.\n\n### Parameters\n\n- `file_ids?: string[]`\n  Optional list of file_id to filter by (only these sources are returned). Repeat the param for multiple IDs.\n\n### Returns\n\n- `{ file_name: string; file_size: number; file_source: string; file_type: string; message: string; project_id: string; project_name: string; status: string; file_id?: string; method?: string; }[]`\n\n### Example\n\n```typescript\nimport Graphor from \'graphor\';\n\nconst client = new Graphor();\n\nconst publicSources = await client.sources.list();\n\nconsole.log(publicSources);\n```',
  },
  {
    name: 'delete',
    endpoint: '/sources/delete',
    httpMethod: 'delete',
    summary: 'Delete a source',
    description:
      "Delete a source from the project's knowledge graph and all associated data.\n\nRemoves the source node, its partitions/chunks, embeddings, and any stored files\nfrom the knowledge graph and object storage. The operation is irreversible.\n\n**Parameters (JSON body):**\n- **file_id** (str, optional — preferred): The unique identifier of the source to\n  delete.\n- **file_name** (str, optional — deprecated): The display name of the source. Use\n  `file_id` instead when possible. At least one of `file_id` or `file_name` must be\n  provided.\n\n**Returns** a `PublicDeleteSourceResponse` with the deletion status, file ID, file\nname, project ID, and project name.\n\n**Error responses:**\n- `400` — Invalid input (e.g. neither identifier provided).\n- `403` — Permission denied.\n- `404` — Source not found.\n- `500` — Unexpected internal error.",
    stainlessPath: '(resource) sources > (method) delete',
    qualified: 'client.sources.delete',
    params: ['file_id?: string;', 'file_name?: string;'],
    response:
      '{ file_name: string; message: string; project_id: string; project_name: string; status: string; file_id?: string; }',
    markdown:
      "## delete\n\n`client.sources.delete(file_id?: string, file_name?: string): { file_name: string; message: string; project_id: string; project_name: string; status: string; file_id?: string; }`\n\n**delete** `/sources/delete`\n\nDelete a source from the project's knowledge graph and all associated data.\n\nRemoves the source node, its partitions/chunks, embeddings, and any stored files\nfrom the knowledge graph and object storage. The operation is irreversible.\n\n**Parameters (JSON body):**\n- **file_id** (str, optional — preferred): The unique identifier of the source to\n  delete.\n- **file_name** (str, optional — deprecated): The display name of the source. Use\n  `file_id` instead when possible. At least one of `file_id` or `file_name` must be\n  provided.\n\n**Returns** a `PublicDeleteSourceResponse` with the deletion status, file ID, file\nname, project ID, and project name.\n\n**Error responses:**\n- `400` — Invalid input (e.g. neither identifier provided).\n- `403` — Permission denied.\n- `404` — Source not found.\n- `500` — Unexpected internal error.\n\n### Parameters\n\n- `file_id?: string`\n  Unique identifier for the source (preferred)\n\n- `file_name?: string`\n  The name of the file to delete (deprecated, use file_id)\n\n### Returns\n\n- `{ file_name: string; message: string; project_id: string; project_name: string; status: string; file_id?: string; }`\n\n  - `file_name: string`\n  - `message: string`\n  - `project_id: string`\n  - `project_name: string`\n  - `status: string`\n  - `file_id?: string`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst source = await client.sources.delete();\n\nconsole.log(source);\n```",
  },
  {
    name: 'ask',
    endpoint: '/sources/ask-sources',
    httpMethod: 'post',
    summary: 'Ask a question about sources',
    description:
      'Ask a natural-language question grounded on the project\'s ingested sources.\n\nThis is the primary Q&A endpoint. It sends the question through the GenAI File Search\npipeline, which retrieves relevant chunks from the knowledge graph, grounds the answer\nin the source documents, and returns a natural-language response. Optionally, you can\nrequest a structured JSON output by supplying an `output_schema`.\n\nConversation memory is supported: pass a `conversation_id` to continue an existing\nconversation, or set `reset` to `true` to start fresh.\n\n**Parameters (JSON body):**\n- **question** (str, required): The question to ask about the sources.\n- **conversation_id** (str, optional): An existing conversation identifier to maintain\n  context across multiple turns.\n- **reset** (bool, optional, default `false`): When `true`, starts a new conversation\n  discarding any previous history.\n- **file_ids** (list[str], optional — preferred): Restrict the search scope to specific\n  source file IDs.\n- **file_names** (list[str], optional — deprecated): Restrict the search scope to\n  specific source file names. Use `file_ids` when possible.\n- **output_schema** (dict, optional): A JSON Schema for requesting structured output.\n  When provided, the response includes a `structured_output` field validated against\n  this schema and the `raw_json` produced by the model.\n- **thinking_level** (str, optional, default `"accurate"`): Controls the model/thinking\n  budget — one of `"fast"`, `"balanced"`, or `"accurate"`.\n\n**Returns** a `PublicAskSourcesResponse` containing:\n- `answer` — the natural-language answer (or a status message when `output_schema` is\n  provided).\n- `structured_output` — the validated structured object (when `output_schema` is\n  provided).\n- `raw_json` — the raw JSON text before validation (when `output_schema` is provided).\n- `conversation_id` — the conversation identifier for follow-up questions.\n\n**Error responses:**\n- `500` — Unexpected internal error while asking sources.',
    stainlessPath: '(resource) sources > (method) ask',
    qualified: 'client.sources.ask',
    params: [
      'question: string;',
      'conversation_id?: string;',
      'file_ids?: string[];',
      'file_names?: string[];',
      'output_schema?: object;',
      'reset?: boolean;',
      "thinking_level?: 'fast' | 'balanced' | 'accurate';",
    ],
    response: '{ answer: string; conversation_id?: string; raw_json?: string; structured_output?: object; }',
    markdown:
      "## ask\n\n`client.sources.ask(question: string, conversation_id?: string, file_ids?: string[], file_names?: string[], output_schema?: object, reset?: boolean, thinking_level?: 'fast' | 'balanced' | 'accurate'): { answer: string; conversation_id?: string; raw_json?: string; structured_output?: object; }`\n\n**post** `/sources/ask-sources`\n\nAsk a natural-language question grounded on the project's ingested sources.\n\nThis is the primary Q&A endpoint. It sends the question through the GenAI File Search\npipeline, which retrieves relevant chunks from the knowledge graph, grounds the answer\nin the source documents, and returns a natural-language response. Optionally, you can\nrequest a structured JSON output by supplying an `output_schema`.\n\nConversation memory is supported: pass a `conversation_id` to continue an existing\nconversation, or set `reset` to `true` to start fresh.\n\n**Parameters (JSON body):**\n- **question** (str, required): The question to ask about the sources.\n- **conversation_id** (str, optional): An existing conversation identifier to maintain\n  context across multiple turns.\n- **reset** (bool, optional, default `false`): When `true`, starts a new conversation\n  discarding any previous history.\n- **file_ids** (list[str], optional — preferred): Restrict the search scope to specific\n  source file IDs.\n- **file_names** (list[str], optional — deprecated): Restrict the search scope to\n  specific source file names. Use `file_ids` when possible.\n- **output_schema** (dict, optional): A JSON Schema for requesting structured output.\n  When provided, the response includes a `structured_output` field validated against\n  this schema and the `raw_json` produced by the model.\n- **thinking_level** (str, optional, default `\"accurate\"`): Controls the model/thinking\n  budget — one of `\"fast\"`, `\"balanced\"`, or `\"accurate\"`.\n\n**Returns** a `PublicAskSourcesResponse` containing:\n- `answer` — the natural-language answer (or a status message when `output_schema` is\n  provided).\n- `structured_output` — the validated structured object (when `output_schema` is\n  provided).\n- `raw_json` — the raw JSON text before validation (when `output_schema` is provided).\n- `conversation_id` — the conversation identifier for follow-up questions.\n\n**Error responses:**\n- `500` — Unexpected internal error while asking sources.\n\n### Parameters\n\n- `question: string`\n  The natural-language question to ask about the sources\n\n- `conversation_id?: string`\n  Conversation identifier to maintain memory context across multiple turns\n\n- `file_ids?: string[]`\n  Optional list of file IDs to restrict search scope (preferred)\n\n- `file_names?: string[]`\n  Optional list of file display names to restrict search scope (deprecated, use file_ids)\n\n- `output_schema?: object`\n  Optional JSON Schema for requesting structured output. When provided, the answer field will contain a short status message and the structured data will be in structured_output.\n\n- `reset?: boolean`\n  When true, starts a new conversation discarding any previous history\n\n- `thinking_level?: 'fast' | 'balanced' | 'accurate'`\n  Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', or 'accurate' (most thorough)\n\n### Returns\n\n- `{ answer: string; conversation_id?: string; raw_json?: string; structured_output?: object; }`\n\n  - `answer: string`\n  - `conversation_id?: string`\n  - `raw_json?: string`\n  - `structured_output?: object`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ask({ question: 'question' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'extract',
    endpoint: '/sources/run-extraction',
    httpMethod: 'post',
    summary: 'Run structured data extraction',
    description:
      'Run a one-off structured data extraction against one or more sources.\n\nThis endpoint uses the GenAI File Search pipeline to read the specified sources,\napply the user-provided instruction, and return structured JSON output conforming\nto the supplied `output_schema`. Internally it builds a grounded prompt, queries\nthe model, and validates/corrects the raw JSON against the schema.\n\n**Parameters (JSON body):**\n- **file_ids** (list[str], optional — preferred): List of source file IDs to extract\n  from.\n- **file_names** (list[str], optional — deprecated): List of source file names to\n  extract from. Use `file_ids` when possible. At least one of the two lists must be\n  provided and non-empty.\n- **user_instruction** (str, required): A natural-language instruction that guides what\n  information to extract from the documents.\n- **output_schema** (dict, required): A JSON Schema object describing the desired\n  structured output shape. The model will produce data conforming to this schema.\n- **thinking_level** (str, optional, default `"accurate"`): Controls the model/thinking\n  budget — one of `"fast"`, `"balanced"`, or `"accurate"`.\n\n**Returns** a `PublicRunExtractionResultResponse` containing:\n- `structured_output` — the validated structured object.\n- `raw_json` — the raw JSON text produced by the model before validation.\n\n**Error responses:**\n- `500` — Unexpected internal error during extraction.',
    stainlessPath: '(resource) sources > (method) extract',
    qualified: 'client.sources.extract',
    params: [
      'output_schema: object;',
      'user_instruction: string;',
      'file_ids?: string[];',
      'file_names?: string[];',
      "thinking_level?: 'fast' | 'balanced' | 'accurate';",
    ],
    response: '{ file_names: string[]; file_ids?: string[]; raw_json?: string; structured_output?: object; }',
    markdown:
      "## extract\n\n`client.sources.extract(output_schema: object, user_instruction: string, file_ids?: string[], file_names?: string[], thinking_level?: 'fast' | 'balanced' | 'accurate'): { file_names: string[]; file_ids?: string[]; raw_json?: string; structured_output?: object; }`\n\n**post** `/sources/run-extraction`\n\nRun a one-off structured data extraction against one or more sources.\n\nThis endpoint uses the GenAI File Search pipeline to read the specified sources,\napply the user-provided instruction, and return structured JSON output conforming\nto the supplied `output_schema`. Internally it builds a grounded prompt, queries\nthe model, and validates/corrects the raw JSON against the schema.\n\n**Parameters (JSON body):**\n- **file_ids** (list[str], optional — preferred): List of source file IDs to extract\n  from.\n- **file_names** (list[str], optional — deprecated): List of source file names to\n  extract from. Use `file_ids` when possible. At least one of the two lists must be\n  provided and non-empty.\n- **user_instruction** (str, required): A natural-language instruction that guides what\n  information to extract from the documents.\n- **output_schema** (dict, required): A JSON Schema object describing the desired\n  structured output shape. The model will produce data conforming to this schema.\n- **thinking_level** (str, optional, default `\"accurate\"`): Controls the model/thinking\n  budget — one of `\"fast\"`, `\"balanced\"`, or `\"accurate\"`.\n\n**Returns** a `PublicRunExtractionResultResponse` containing:\n- `structured_output` — the validated structured object.\n- `raw_json` — the raw JSON text produced by the model before validation.\n\n**Error responses:**\n- `500` — Unexpected internal error during extraction.\n\n### Parameters\n\n- `output_schema: object`\n  JSON Schema describing the desired structured output shape. The model will produce data conforming to this schema.\n\n- `user_instruction: string`\n  Natural-language instruction guiding what information to extract\n\n- `file_ids?: string[]`\n  List of file IDs to extract from (preferred)\n\n- `file_names?: string[]`\n  List of file names to extract from (deprecated, use file_ids)\n\n- `thinking_level?: 'fast' | 'balanced' | 'accurate'`\n  Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', or 'accurate' (most thorough)\n\n### Returns\n\n- `{ file_names: string[]; file_ids?: string[]; raw_json?: string; structured_output?: object; }`\n\n  - `file_names: string[]`\n  - `file_ids?: string[]`\n  - `raw_json?: string`\n  - `structured_output?: object`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.extract({\n  output_schema: { foo: 'bar' },\n  user_instruction: 'user_instruction',\n});\n\nconsole.log(response);\n```",
  },
  {
    name: 'get_build_status',
    endpoint: '/sources/builds/{build_id}',
    httpMethod: 'get',
    summary: 'Get build status and optional elements',
    description:
      'Return the status and optional parsed elements for an async build identified by `build_id`.\n\nUse this endpoint to poll the result of an async ingestion or re-process request. The\n`build_id` is returned in the response of:\n\n- `POST /v2/sources/upload` (async file upload)\n- `POST /v2/sources/upload-url-source` (async URL ingestion)\n- `POST /v2/sources/upload-github-source` (async GitHub ingestion)\n- `POST /v2/sources/upload-youtube-source` (async YouTube ingestion)\n- `POST /v2/sources/process` (async re-process)\n\n**Path parameter:**\n- **build_id** (str, required): The build identifier returned when the job was scheduled.\n\n**Query parameters:**\n- **suppress_elements** (bool, default `false`): When `true`, elements are omitted from\n  the response. When `false` (default), the response includes\n  the parsed elements (chunks/partitions) for the build if it completed successfully.\n  Same structure as `POST /sources/elements` (each element has `page_content` and\n  `metadata`). If `page` and `page_size` are not passed, all elements are returned.\n- **suppress_img_base64** (bool, default `false`): When `true`, `img_base64` is omitted\n  from each element (useful to reduce payload size when images are not needed).\n- **page** (int, optional): 1-based page number. Only used when `suppress_elements=false`\n  and pagination is used (pass either `page` or `page_size` to enable pagination).\n- **page_size** (int, optional): Number of elements per page (max 100). Only used\n  when `suppress_elements=false` and pagination is used.\n\n**Response fields:**\n- **build_id**: The requested build identifier.\n- **status**: SourceNodeStatus value when history exists (e.g. Processed, Processing,\n  Processing failed). `not_found` when no history exists (build in progress or invalid id).\n- **success**: `true` only when `status == "Completed"` (SourceNodeStatus.COMPLETED).\n- **file_id**, **file_name**: Source identifiers; present when the build has been\n  persisted (history exists).\n- **error**: Error message from the pipeline when the build failed.\n- **method**, **total_partitions**, **total_pages**: Build metadata when\n  history exists.\n- **created_at**, **updated_at**: ISO8601 timestamps when history exists.\n- **document_annotation**: Document-level summary/annotation from the build history when available.\n- **message**: Human-readable message (e.g. when status is `not_found`).\n- **elements**: List of `{ page_content, metadata }` when `suppress_elements=false`\n  and the build completed successfully.\n- **total_elements**, **page**, **page_size**, **total_pages_elements**: Pagination\n  metadata for `elements` when `suppress_elements=false`.\n\n**Error responses:**\n- `500` — Unexpected internal error.',
    stainlessPath: '(resource) sources > (method) get_build_status',
    qualified: 'client.sources.getBuildStatus',
    params: [
      'build_id: string;',
      'page?: number;',
      'page_size?: number;',
      'suppress_elements?: boolean;',
      'suppress_img_base64?: boolean;',
    ],
    response:
      "{ build_id: string; status: string; success: boolean; created_at?: string; document_annotation?: string; elements?: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; error?: string; file_id?: string; file_name?: string; message?: string; method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'; page?: number; page_size?: number; total_elements?: number; total_pages?: number; total_pages_elements?: number; total_partitions?: number; updated_at?: string; }",
    markdown:
      "## get_build_status\n\n`client.sources.getBuildStatus(build_id: string, page?: number, page_size?: number, suppress_elements?: boolean, suppress_img_base64?: boolean): { build_id: string; status: string; success: boolean; created_at?: string; document_annotation?: string; elements?: element[]; error?: string; file_id?: string; file_name?: string; message?: string; method?: method; page?: number; page_size?: number; total_elements?: number; total_pages?: number; total_pages_elements?: number; total_partitions?: number; updated_at?: string; }`\n\n**get** `/sources/builds/{build_id}`\n\nReturn the status and optional parsed elements for an async build identified by `build_id`.\n\nUse this endpoint to poll the result of an async ingestion or re-process request. The\n`build_id` is returned in the response of:\n\n- `POST /v2/sources/upload` (async file upload)\n- `POST /v2/sources/upload-url-source` (async URL ingestion)\n- `POST /v2/sources/upload-github-source` (async GitHub ingestion)\n- `POST /v2/sources/upload-youtube-source` (async YouTube ingestion)\n- `POST /v2/sources/process` (async re-process)\n\n**Path parameter:**\n- **build_id** (str, required): The build identifier returned when the job was scheduled.\n\n**Query parameters:**\n- **suppress_elements** (bool, default `false`): When `true`, elements are omitted from\n  the response. When `false` (default), the response includes\n  the parsed elements (chunks/partitions) for the build if it completed successfully.\n  Same structure as `POST /sources/elements` (each element has `page_content` and\n  `metadata`). If `page` and `page_size` are not passed, all elements are returned.\n- **suppress_img_base64** (bool, default `false`): When `true`, `img_base64` is omitted\n  from each element (useful to reduce payload size when images are not needed).\n- **page** (int, optional): 1-based page number. Only used when `suppress_elements=false`\n  and pagination is used (pass either `page` or `page_size` to enable pagination).\n- **page_size** (int, optional): Number of elements per page (max 100). Only used\n  when `suppress_elements=false` and pagination is used.\n\n**Response fields:**\n- **build_id**: The requested build identifier.\n- **status**: SourceNodeStatus value when history exists (e.g. Processed, Processing,\n  Processing failed). `not_found` when no history exists (build in progress or invalid id).\n- **success**: `true` only when `status == \"Completed\"` (SourceNodeStatus.COMPLETED).\n- **file_id**, **file_name**: Source identifiers; present when the build has been\n  persisted (history exists).\n- **error**: Error message from the pipeline when the build failed.\n- **method**, **total_partitions**, **total_pages**: Build metadata when\n  history exists.\n- **created_at**, **updated_at**: ISO8601 timestamps when history exists.\n- **document_annotation**: Document-level summary/annotation from the build history when available.\n- **message**: Human-readable message (e.g. when status is `not_found`).\n- **elements**: List of `{ page_content, metadata }` when `suppress_elements=false`\n  and the build completed successfully.\n- **total_elements**, **page**, **page_size**, **total_pages_elements**: Pagination\n  metadata for `elements` when `suppress_elements=false`.\n\n**Error responses:**\n- `500` — Unexpected internal error.\n\n### Parameters\n\n- `build_id: string`\n\n- `page?: number`\n\n- `page_size?: number`\n\n- `suppress_elements?: boolean`\n\n- `suppress_img_base64?: boolean`\n\n### Returns\n\n- `{ build_id: string; status: string; success: boolean; created_at?: string; document_annotation?: string; elements?: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; error?: string; file_id?: string; file_name?: string; message?: string; method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'; page?: number; page_size?: number; total_elements?: number; total_pages?: number; total_pages_elements?: number; total_partitions?: number; updated_at?: string; }`\n  Status and optional result for an async build (ingestion/re-process) identified by build_id.\n\nReturned by GET /v2/sources/builds/{build_id}. When the build has completed successfully,\nincludes file_id, file_name, and optionally paginated elements (parsed chunks).\n\n  - `build_id: string`\n  - `status: string`\n  - `success: boolean`\n  - `created_at?: string`\n  - `document_annotation?: string`\n  - `elements?: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]`\n  - `error?: string`\n  - `file_id?: string`\n  - `file_name?: string`\n  - `message?: string`\n  - `method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'`\n  - `page?: number`\n  - `page_size?: number`\n  - `total_elements?: number`\n  - `total_pages?: number`\n  - `total_pages_elements?: number`\n  - `total_partitions?: number`\n  - `updated_at?: string`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.getBuildStatus('build_id');\n\nconsole.log(response);\n```",
  },
  {
    name: 'get_elements',
    endpoint: '/sources/get-elements',
    httpMethod: 'get',
    summary: 'Get parsed elements of a source (v2 format)',
    description:
      'Retrieve the parsed elements (chunks/partitions) of a source in the same format as get_build_status.\n\nReturns elements with explicit fields: element_id, element_type, text, markdown, html,\nimg_base64 (optional), position, page_number, bounding_box, page_layout, etc.\n\n**Query parameters:**\n- **file_id** (str, required): Unique identifier of the source.\n- **page** (int, optional): 1-based page number. Use with page_size to enable pagination.\n- **page_size** (int, optional): Number of elements per page (max 100).\n- **suppress_img_base64** (bool, default false): When true, img_base64 is omitted from each element.\n- **type** (str, optional): Filter by element type (e.g. NarrativeText, Title, Table).\n- **page_numbers** (list, optional): Restrict to specific page numbers (repeat param for multiple).\n- **elementsToRemove** (list, optional): Element types to exclude (repeat param for multiple).\n\n**Returns** Paginated response with items as BuildStatusElement list (same shape as GET /builds/{build_id} elements).',
    stainlessPath: '(resource) sources > (method) get_elements',
    qualified: 'client.sources.getElements',
    params: [
      'file_id: string;',
      'elementsToRemove?: string[];',
      'page?: number;',
      'page_numbers?: number[];',
      'page_size?: number;',
      'suppress_img_base64?: boolean;',
      'type?: string;',
    ],
    response:
      '{ items: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; total: number; page?: number; page_size?: number; total_pages?: number; }',
    markdown:
      "## get_elements\n\n`client.sources.getElements(file_id: string, elementsToRemove?: string[], page?: number, page_numbers?: number[], page_size?: number, suppress_img_base64?: boolean, type?: string): { items: element[]; total: number; page?: number; page_size?: number; total_pages?: number; }`\n\n**get** `/sources/get-elements`\n\nRetrieve the parsed elements (chunks/partitions) of a source in the same format as get_build_status.\n\nReturns elements with explicit fields: element_id, element_type, text, markdown, html,\nimg_base64 (optional), position, page_number, bounding_box, page_layout, etc.\n\n**Query parameters:**\n- **file_id** (str, required): Unique identifier of the source.\n- **page** (int, optional): 1-based page number. Use with page_size to enable pagination.\n- **page_size** (int, optional): Number of elements per page (max 100).\n- **suppress_img_base64** (bool, default false): When true, img_base64 is omitted from each element.\n- **type** (str, optional): Filter by element type (e.g. NarrativeText, Title, Table).\n- **page_numbers** (list, optional): Restrict to specific page numbers (repeat param for multiple).\n- **elementsToRemove** (list, optional): Element types to exclude (repeat param for multiple).\n\n**Returns** Paginated response with items as BuildStatusElement list (same shape as GET /builds/{build_id} elements).\n\n### Parameters\n\n- `file_id: string`\n  Unique identifier of the source\n\n- `elementsToRemove?: string[]`\n  Element types to exclude\n\n- `page?: number`\n  1-based page number (use with page_size)\n\n- `page_numbers?: number[]`\n  Restrict to specific page numbers\n\n- `page_size?: number`\n  Number of elements per page\n\n- `suppress_img_base64?: boolean`\n  When true, img_base64 is omitted from each element\n\n- `type?: string`\n  Filter by element type (e.g. NarrativeText, Title)\n\n### Returns\n\n- `{ items: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; total: number; page?: number; page_size?: number; total_pages?: number; }`\n\n  - `items: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]`\n  - `total: number`\n  - `page?: number`\n  - `page_size?: number`\n  - `total_pages?: number`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.getElements({ file_id: 'file_id' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'ingest_file',
    endpoint: '/sources/ingest-file',
    httpMethod: 'post',
    summary: 'Upload a local file (async)',
    description:
      'Upload a local file and schedule ingestion in the background.\n\nAccepts **`multipart/form-data`** with the file. Validates size (max 100 MB) and\nextension, stores the file, then schedules the full data-ingestion pipeline in the\nbackground. Returns immediately with a `build_id` to poll for status.\n\n**Parameters:**\n- **file** (`multipart/form-data`): The file to upload. Must include `Content-Length`\n  and have a supported extension (pdf, doc, docx, csv, txt, md, etc.).\n- **method** (`form`, optional): Partitioning strategy. One of: `fast`,\n  `balanced`, `accurate`, `vlm`, `agentic`. Default when omitted.\n\n**Returns** `AsyncIngestResponse` with `build_id`. Use it to check processing status.',
    stainlessPath: '(resource) sources > (method) ingest_file',
    qualified: 'client.sources.ingestFile',
    params: ['file: string;', "method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic';"],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## ingest_file\n\n`client.sources.ingestFile(file: string, method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-file`\n\nUpload a local file and schedule ingestion in the background.\n\nAccepts **`multipart/form-data`** with the file. Validates size (max 100 MB) and\nextension, stores the file, then schedules the full data-ingestion pipeline in the\nbackground. Returns immediately with a `build_id` to poll for status.\n\n**Parameters:**\n- **file** (`multipart/form-data`): The file to upload. Must include `Content-Length`\n  and have a supported extension (pdf, doc, docx, csv, txt, md, etc.).\n- **method** (`form`, optional): Partitioning strategy. One of: `fast`,\n  `balanced`, `accurate`, `vlm`, `agentic`. Default when omitted.\n\n**Returns** `AsyncIngestResponse` with `build_id`. Use it to check processing status.\n\n### Parameters\n\n- `file: string`\n\n- `method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'`\n  Public-facing partition method names for API v2.\n\nMaps to internal PartitionMethod as:\n- fast     → basic\n- balanced → hi_res\n- accurate → hi_res_ft\n- vlm      → mai\n- agentic  → graphorlm\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestFile({ file: fs.createReadStream('path/to/file') });\n\nconsole.log(response);\n```",
  },
  {
    name: 'ingest_github',
    endpoint: '/sources/ingest-github',
    httpMethod: 'post',
    summary: 'Ingest a GitHub repository (async)',
    description:
      "Ingest a GitHub repository as a source into the project's knowledge graph.\n\nSchedules the ingestion in the background and returns immediately with a `build_id`.\nUse the returned `build_id` to poll for processing status.\n\n**Parameters (JSON body):**\n- **url** (str, required): The GitHub repository URL to ingest\n  (e.g. `https://github.com/owner/repo`).\n\n**Returns** `AsyncIngestResponse` with `build_id`.",
    stainlessPath: '(resource) sources > (method) ingest_github',
    qualified: 'client.sources.ingestGitHub',
    params: ['url: string;'],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## ingest_github\n\n`client.sources.ingestGitHub(url: string): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-github`\n\nIngest a GitHub repository as a source into the project's knowledge graph.\n\nSchedules the ingestion in the background and returns immediately with a `build_id`.\nUse the returned `build_id` to poll for processing status.\n\n**Parameters (JSON body):**\n- **url** (str, required): The GitHub repository URL to ingest\n  (e.g. `https://github.com/owner/repo`).\n\n**Returns** `AsyncIngestResponse` with `build_id`.\n\n### Parameters\n\n- `url: string`\n  The GitHub repository URL to ingest (e.g. https://github.com/owner/repo)\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestGitHub({ url: 'url' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'ingest_url',
    endpoint: '/sources/ingest-url',
    httpMethod: 'post',
    summary: 'Ingest a web page URL (async)',
    description:
      'Ingest a web page (or a set of crawled pages) as a source into the project\'s knowledge graph.\n\nUnlike the synchronous version, this endpoint schedules the ingestion in the background\nand returns immediately with a `processing` status. The source will be fully available\nonce background processing completes.\n\nIf the URL points directly to a downloadable file (detected via URL path extension or\nHTTP Content-Type), the file is first downloaded and uploaded to storage synchronously,\nthen the partition/embedding pipeline runs in the background.\n\n**Parameters (JSON body):**\n- **url** (str, required): The web page URL to ingest.\n- **crawlUrls** (bool, optional, default `false`): When `true`, the system will also\n  follow and ingest links found on the page. Ignored when the URL resolves to a file.\n- **method** (str, optional): The partitioning strategy to use.\n  One of: `fast`, `balanced`, `accurate`, `vlm`, `agentic`. When omitted the system default is applied.\n\n**Returns** a `PublicSourceResponse` with `status: "processing"` immediately.\nPoll the source status endpoint using the returned `file_id` to track completion.\n\n**Error responses:**\n- `400` — Unsupported file type detected from a file URL.\n- `500` — Unexpected internal error during URL processing.',
    stainlessPath: '(resource) sources > (method) ingest_url',
    qualified: 'client.sources.ingestURL',
    params: [
      'url: string;',
      'crawlUrls?: boolean;',
      "method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic';",
    ],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## ingest_url\n\n`client.sources.ingestURL(url: string, crawlUrls?: boolean, method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-url`\n\nIngest a web page (or a set of crawled pages) as a source into the project's knowledge graph.\n\nUnlike the synchronous version, this endpoint schedules the ingestion in the background\nand returns immediately with a `processing` status. The source will be fully available\nonce background processing completes.\n\nIf the URL points directly to a downloadable file (detected via URL path extension or\nHTTP Content-Type), the file is first downloaded and uploaded to storage synchronously,\nthen the partition/embedding pipeline runs in the background.\n\n**Parameters (JSON body):**\n- **url** (str, required): The web page URL to ingest.\n- **crawlUrls** (bool, optional, default `false`): When `true`, the system will also\n  follow and ingest links found on the page. Ignored when the URL resolves to a file.\n- **method** (str, optional): The partitioning strategy to use.\n  One of: `fast`, `balanced`, `accurate`, `vlm`, `agentic`. When omitted the system default is applied.\n\n**Returns** a `PublicSourceResponse` with `status: \"processing\"` immediately.\nPoll the source status endpoint using the returned `file_id` to track completion.\n\n**Error responses:**\n- `400` — Unsupported file type detected from a file URL.\n- `500` — Unexpected internal error during URL processing.\n\n### Parameters\n\n- `url: string`\n  The web page URL to ingest\n\n- `crawlUrls?: boolean`\n  When true, also follows and ingests links found on the page\n\n- `method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'`\n  Public-facing partition method names for API v2.\n\nMaps to internal PartitionMethod as:\n- fast     → basic\n- balanced → hi_res\n- accurate → hi_res_ft\n- vlm      → mai\n- agentic  → graphorlm\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestURL({ url: 'url' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'ingest_youtube',
    endpoint: '/sources/ingest-youtube',
    httpMethod: 'post',
    summary: 'Ingest a YouTube video (async)',
    description:
      "Ingest a YouTube video as a source into the project's knowledge graph.\n\nSchedules the ingestion in the background and returns immediately with a `build_id`.\nThe endpoint will download the transcript/captions and process them in the background.\nUse the returned `build_id` to poll for processing status.\n\n**Parameters (JSON body):**\n- **url** (str, required): The YouTube video URL to ingest\n  (e.g. `https://www.youtube.com/watch?v=...`).\n\n**Returns** `AsyncIngestResponse` with `build_id`.",
    stainlessPath: '(resource) sources > (method) ingest_youtube',
    qualified: 'client.sources.ingestYoutube',
    params: ['url: string;'],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## ingest_youtube\n\n`client.sources.ingestYoutube(url: string): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-youtube`\n\nIngest a YouTube video as a source into the project's knowledge graph.\n\nSchedules the ingestion in the background and returns immediately with a `build_id`.\nThe endpoint will download the transcript/captions and process them in the background.\nUse the returned `build_id` to poll for processing status.\n\n**Parameters (JSON body):**\n- **url** (str, required): The YouTube video URL to ingest\n  (e.g. `https://www.youtube.com/watch?v=...`).\n\n**Returns** `AsyncIngestResponse` with `build_id`.\n\n### Parameters\n\n- `url: string`\n  The YouTube video URL to ingest (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestYoutube({ url: 'url' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'reprocess',
    endpoint: '/sources/reprocess',
    httpMethod: 'post',
    summary: 'Re-process an existing source (async)',
    description:
      'Re-process (re-parse) an existing source in the background.\n\nSchedules the data-ingestion pipeline (partitioning, chunking, embedding) for an\nexisting source and returns immediately with a `build_id`. Use it to poll for status.\n\n**Parameters (JSON body):**\n- **file_id** (str, required): Unique identifier of the source to re-process.\n- **method** (str, default `"fast"`): Partitioning strategy. One of:\n  `fast`, `balanced`, `accurate`, `vlm`, `agentic`.\n\n**Returns** `AsyncIngestResponse` with `build_id`.',
    stainlessPath: '(resource) sources > (method) reprocess',
    qualified: 'client.sources.reprocess',
    params: ['file_id: string;', "method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic';"],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## reprocess\n\n`client.sources.reprocess(file_id: string, method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/reprocess`\n\nRe-process (re-parse) an existing source in the background.\n\nSchedules the data-ingestion pipeline (partitioning, chunking, embedding) for an\nexisting source and returns immediately with a `build_id`. Use it to poll for status.\n\n**Parameters (JSON body):**\n- **file_id** (str, required): Unique identifier of the source to re-process.\n- **method** (str, default `\"fast\"`): Partitioning strategy. One of:\n  `fast`, `balanced`, `accurate`, `vlm`, `agentic`.\n\n**Returns** `AsyncIngestResponse` with `build_id`.\n\n### Parameters\n\n- `file_id: string`\n  Unique identifier of the source to re-process.\n\n- `method?: 'fast' | 'balanced' | 'accurate' | 'vlm' | 'agentic'`\n  Partitioning strategy. One of: fast, balanced, accurate, vlm, agentic.\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.reprocess({ file_id: 'file_id' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'retrieve_chunks',
    endpoint: '/sources/prebuilt-rag',
    httpMethod: 'post',
    summary: 'Retrieve chunks from the RAG store',
    description:
      "Retrieve relevant document chunks from the prebuilt RAG vector store.\n\nPerforms a semantic similarity search over the project's prebuilt RAG store using\nGoogle File Search with grounding. Returns the most relevant text chunks along with\ntheir source metadata (file name, page number, relevance score). This is a pure\nretrieval endpoint — it does **not** generate an answer; use `/ask-sources` for Q&A.\n\n**Parameters (JSON body):**\n- **query** (str, required): The natural-language search query used to find relevant\n  chunks.\n- **file_ids** (list[str], optional — preferred): Restrict retrieval to specific source\n  file IDs.\n- **file_names** (list[str], optional — deprecated): Restrict retrieval to specific\n  source file names. Use `file_ids` when possible.\n\n**Returns** a `PublicRetrieveResponse` containing:\n- `query` — the original search query.\n- `chunks` — a list of `PublicRetrieveChunk` objects, each with `text`,\n  `file_name`, `page_number`, `score`, and additional `metadata`.\n- `total` — the total number of chunks returned.\n\n**Error responses:**\n- `500` — Unexpected internal error during retrieval.",
    stainlessPath: '(resource) sources > (method) retrieve_chunks',
    qualified: 'client.sources.retrieveChunks',
    params: ['query: string;', 'file_ids?: string[];', 'file_names?: string[];'],
    response:
      '{ query: string; total: number; chunks?: { text: string; file_id?: string; file_name?: string; metadata?: object; page_number?: number; score?: number; }[]; }',
    markdown:
      "## retrieve_chunks\n\n`client.sources.retrieveChunks(query: string, file_ids?: string[], file_names?: string[]): { query: string; total: number; chunks?: object[]; }`\n\n**post** `/sources/prebuilt-rag`\n\nRetrieve relevant document chunks from the prebuilt RAG vector store.\n\nPerforms a semantic similarity search over the project's prebuilt RAG store using\nGoogle File Search with grounding. Returns the most relevant text chunks along with\ntheir source metadata (file name, page number, relevance score). This is a pure\nretrieval endpoint — it does **not** generate an answer; use `/ask-sources` for Q&A.\n\n**Parameters (JSON body):**\n- **query** (str, required): The natural-language search query used to find relevant\n  chunks.\n- **file_ids** (list[str], optional — preferred): Restrict retrieval to specific source\n  file IDs.\n- **file_names** (list[str], optional — deprecated): Restrict retrieval to specific\n  source file names. Use `file_ids` when possible.\n\n**Returns** a `PublicRetrieveResponse` containing:\n- `query` — the original search query.\n- `chunks` — a list of `PublicRetrieveChunk` objects, each with `text`,\n  `file_name`, `page_number`, `score`, and additional `metadata`.\n- `total` — the total number of chunks returned.\n\n**Error responses:**\n- `500` — Unexpected internal error during retrieval.\n\n### Parameters\n\n- `query: string`\n  The natural-language search query to find relevant chunks\n\n- `file_ids?: string[]`\n  Optional list of file IDs to restrict retrieval scope (preferred)\n\n- `file_names?: string[]`\n  Optional list of file names to restrict retrieval scope (deprecated, use file_ids)\n\n### Returns\n\n- `{ query: string; total: number; chunks?: { text: string; file_id?: string; file_name?: string; metadata?: object; page_number?: number; score?: number; }[]; }`\n\n  - `query: string`\n  - `total: number`\n  - `chunks?: { text: string; file_id?: string; file_name?: string; metadata?: object; page_number?: number; score?: number; }[]`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.retrieveChunks({ query: 'query' });\n\nconsole.log(response);\n```",
  },
];

const EMBEDDED_READMES: { language: string; content: string }[] = [];

const INDEX_OPTIONS = {
  fields: [
    'name',
    'endpoint',
    'summary',
    'description',
    'qualified',
    'stainlessPath',
    'content',
    'sectionContext',
  ],
  storeFields: ['kind', '_original'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.1,
    boost: {
      name: 5,
      stainlessPath: 3,
      endpoint: 3,
      qualified: 3,
      summary: 2,
      content: 1,
      description: 1,
    } as Record<string, number>,
  },
};

/**
 * Self-contained local search engine backed by MiniSearch.
 * Method data is embedded at SDK build time; prose documents
 * can be loaded from an optional docs directory at runtime.
 */
export class LocalDocsSearch {
  private methodIndex: MiniSearch<MiniSearchDocument>;
  private proseIndex: MiniSearch<MiniSearchDocument>;

  private constructor() {
    this.methodIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
    this.proseIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
  }

  static async create(opts?: { docsDir?: string }): Promise<LocalDocsSearch> {
    const instance = new LocalDocsSearch();
    instance.indexMethods(EMBEDDED_METHODS);
    for (const readme of EMBEDDED_READMES) {
      instance.indexProse(readme.content, `readme:${readme.language}`);
    }
    if (opts?.docsDir) {
      await instance.loadDocsDirectory(opts.docsDir);
    }
    return instance;
  }

  search(props: {
    query: string;
    language?: string;
    detail?: string;
    maxResults?: number;
    maxLength?: number;
  }): SearchResult {
    const { query, language = 'typescript', detail = 'default', maxResults = 5, maxLength = 100_000 } = props;

    const useMarkdown = detail === 'verbose' || detail === 'high';

    // Search both indices and merge results by score.
    // Filter prose hits so language-tagged content (READMEs and docs with
    // frontmatter) only matches the requested language.
    const methodHits = this.methodIndex
      .search(query)
      .map((hit) => ({ ...hit, _kind: 'http_method' as const }));
    const proseHits = this.proseIndex
      .search(query)
      .filter((hit) => {
        const source = ((hit as Record<string, unknown>)['_original'] as ProseChunk | undefined)?.source;
        if (!source) return true;
        // Check for language-tagged sources: "readme:<lang>" or "lang:<lang>:<filename>"
        let taggedLang: string | undefined;
        if (source.startsWith('readme:')) taggedLang = source.slice('readme:'.length);
        else if (source.startsWith('lang:')) taggedLang = source.split(':')[1];
        if (!taggedLang) return true;
        return taggedLang === language || (language === 'javascript' && taggedLang === 'typescript');
      })
      .map((hit) => ({ ...hit, _kind: 'prose' as const }));
    const merged = [...methodHits, ...proseHits].sort((a, b) => b.score - a.score);
    const top = merged.slice(0, maxResults);

    const fullResults: (string | Record<string, unknown>)[] = [];

    for (const hit of top) {
      const original = (hit as Record<string, unknown>)['_original'];
      if (hit._kind === 'http_method') {
        const m = original as MethodEntry;
        if (useMarkdown && m.markdown) {
          fullResults.push(m.markdown);
        } else {
          // Use per-language data when available, falling back to the
          // top-level fields (which are TypeScript-specific in the
          // legacy codepath).
          const langData = m.perLanguage?.[language];
          fullResults.push({
            method: langData?.method ?? m.qualified,
            summary: m.summary,
            description: m.description,
            endpoint: `${m.httpMethod.toUpperCase()} ${m.endpoint}`,
            ...(langData?.example ? { example: langData.example } : {}),
            ...(m.params ? { params: m.params } : {}),
            ...(m.response ? { response: m.response } : {}),
          });
        }
      } else {
        const c = original as ProseChunk;
        fullResults.push({
          content: c.content,
          ...(c.source ? { source: c.source } : {}),
        });
      }
    }

    let totalLength = 0;
    const results: (string | Record<string, unknown>)[] = [];
    for (const result of fullResults) {
      const len = typeof result === 'string' ? result.length : JSON.stringify(result).length;
      totalLength += len;
      if (totalLength > maxLength) break;
      results.push(result);
    }

    if (results.length < fullResults.length) {
      results.unshift(`Truncated; showing ${results.length} of ${fullResults.length} results.`);
    }

    return { results };
  }

  private indexMethods(methods: MethodEntry[]): void {
    const docs: MiniSearchDocument[] = methods.map((m, i) => ({
      id: `method-${i}`,
      kind: 'http_method' as const,
      name: m.name,
      endpoint: m.endpoint,
      summary: m.summary,
      description: m.description,
      qualified: m.qualified,
      stainlessPath: m.stainlessPath,
      _original: m as unknown as Record<string, unknown>,
    }));
    if (docs.length > 0) {
      this.methodIndex.addAll(docs);
    }
  }

  private async loadDocsDirectory(docsDir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(docsDir, { withFileTypes: true });
    } catch (err) {
      getLogger().warn({ err, docsDir }, 'Could not read docs directory');
      return;
    }

    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => e.name.endsWith('.md') || e.name.endsWith('.markdown') || e.name.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(docsDir, file.name);
        const content = await fs.readFile(filePath, 'utf-8');

        if (file.name.endsWith('.json')) {
          const texts = extractTexts(JSON.parse(content));
          if (texts.length > 0) {
            this.indexProse(texts.join('\n\n'), file.name);
          }
        } else {
          // Parse optional YAML frontmatter for language tagging.
          // Files with a "language" field in frontmatter will only
          // surface in searches for that language.
          //
          // Example:
          //   ---
          //   language: python
          //   ---
          //   # Error handling in Python
          //   ...
          const frontmatter = parseFrontmatter(content);
          const source = frontmatter.language ? `lang:${frontmatter.language}:${file.name}` : file.name;
          this.indexProse(content, source);
        }
      } catch (err) {
        getLogger().warn({ err, file: file.name }, 'Failed to index docs file');
      }
    }
  }

  private indexProse(markdown: string, source: string): void {
    const chunks = chunkMarkdown(markdown);
    const baseId = this.proseIndex.documentCount;

    const docs: MiniSearchDocument[] = chunks.map((chunk, i) => ({
      id: `prose-${baseId + i}`,
      kind: 'prose' as const,
      content: chunk.content,
      ...(chunk.sectionContext != null ? { sectionContext: chunk.sectionContext } : {}),
      _original: { ...chunk, source } as unknown as Record<string, unknown>,
    }));

    if (docs.length > 0) {
      this.proseIndex.addAll(docs);
    }
  }
}

/** Lightweight markdown chunker — splits on headers, chunks by word count. */
function chunkMarkdown(markdown: string): { content: string; tag: string; sectionContext?: string }[] {
  // Strip YAML frontmatter
  const stripped = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const lines = stripped.split('\n');

  const chunks: { content: string; tag: string; sectionContext?: string }[] = [];
  const headers: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const text = current.join('\n').trim();
    if (!text) return;
    const sectionContext = headers.length > 0 ? headers.join(' > ') : undefined;
    // Split into ~200-word chunks
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i += 200) {
      const slice = words.slice(i, i + 200).join(' ');
      if (slice) {
        chunks.push({ content: slice, tag: 'p', ...(sectionContext != null ? { sectionContext } : {}) });
      }
    }
    current = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      flush();
      const level = headerMatch[1]!.length;
      const text = headerMatch[2]!.trim();
      while (headers.length >= level) headers.pop();
      headers.push(text);
    } else {
      current.push(line);
    }
  }
  flush();

  return chunks;
}

/** Recursively extracts string values from a JSON structure. */
function extractTexts(data: unknown, depth = 0): string[] {
  if (depth > 10) return [];
  if (typeof data === 'string') return data.trim() ? [data] : [];
  if (Array.isArray(data)) return data.flatMap((item) => extractTexts(item, depth + 1));
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).flatMap((v) => extractTexts(v, depth + 1));
  }
  return [];
}

/** Parses YAML frontmatter from a markdown string, extracting the language field if present. */
function parseFrontmatter(markdown: string): { language?: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const body = match[1] ?? '';
  const langMatch = body.match(/^language:\s*(.+)$/m);
  return langMatch ? { language: langMatch[1]!.trim() } : {};
}
