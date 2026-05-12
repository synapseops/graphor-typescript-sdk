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
    name: 'get_build_status',
    endpoint: '/sources/builds/{build_id}',
    httpMethod: 'get',
    summary: 'Get build status and optional elements',
    description:
      'Return the status and optional parsed elements for an async build identified by `build_id`.\n\nUse this endpoint to poll the result of an async ingestion or re-process request. The\n`build_id` is returned in the response of:\n\n- `POST /v2/sources/upload` (async file upload)\n- `POST /v2/sources/upload-url-source` (async URL ingestion)\n- `POST /v2/sources/upload-github-source` (async GitHub ingestion)\n- `POST /v2/sources/upload-youtube-source` (async YouTube ingestion)\n- `POST /v2/sources/process` (async re-process)\n\n**Path parameter:**\n- **build_id** (str, required): The build identifier returned when the job was scheduled.\n\n**Query parameters:**\n- **suppress_elements** (bool, default `false`): When `true`, elements are omitted from\n  the response. When `false` (default), the response includes\n  the parsed elements (chunks/partitions) for the build if it completed successfully.\n  Same structure as `POST /sources/elements` (each element has `page_content` and\n  `metadata`). If `page` and `page_size` are not passed, all elements are returned.\n- **suppress_img_base64** (bool, default `false`): When `true`, `img_base64` is omitted\n  from each element (useful to reduce payload size when images are not needed).\n- **page** (int, optional): 1-based page number. Only used when `suppress_elements=false`\n  and pagination is used (pass either `page` or `page_size` to enable pagination).\n- **page_size** (int, optional): Number of elements per page (max 100). Only used\n  when `suppress_elements=false` and pagination is used.\n\n**Response fields:**\n- **build_id**: The requested build identifier.\n- **status**: SourceNodeStatus value when history exists (e.g. Processed, Processing,\n  Processing failed). `not_found` when no history exists (build in progress or invalid id).\n- **success**: `true` when the build completed (status is "Completed" or "Completed with errors").\n- **file_id**, **file_name**: Source identifiers; present when the build has been\n  persisted (history exists).\n- **error**: Error message from the pipeline when the build failed.\n- **method**, **total_partitions**, **total_pages**: Build metadata when\n  history exists.\n- **created_at**, **updated_at**: ISO8601 timestamps when history exists.\n- **document_annotation**: Document-level summary/annotation from the build history when available.\n- **message**: Human-readable message (e.g. when status is `not_found`).\n- **elements**: List of `{ page_content, metadata }` when `suppress_elements=false`\n  and the build completed successfully.\n- **total_elements**, **page**, **page_size**, **total_pages_elements**: Pagination\n  metadata for `elements` when `suppress_elements=false`.\n\n**Error responses:**\n- `500` — Unexpected internal error.',
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
      "{ build_id: string; status: string; success: boolean; created_at?: string; document_annotation?: string; elements?: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; error?: string; failed_batches_count?: number; file_id?: string; file_name?: string; has_failed_batches?: boolean; message?: string; method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'; page?: number; page_size?: number; total_elements?: number; total_pages?: number; total_pages_elements?: number; total_partitions?: number; updated_at?: string; }",
    markdown:
      "## get_build_status\n\n`client.sources.getBuildStatus(build_id: string, page?: number, page_size?: number, suppress_elements?: boolean, suppress_img_base64?: boolean): { build_id: string; status: string; success: boolean; created_at?: string; document_annotation?: string; elements?: element[]; error?: string; failed_batches_count?: number; file_id?: string; file_name?: string; has_failed_batches?: boolean; message?: string; method?: method; page?: number; page_size?: number; total_elements?: number; total_pages?: number; total_pages_elements?: number; total_partitions?: number; updated_at?: string; }`\n\n**get** `/sources/builds/{build_id}`\n\nReturn the status and optional parsed elements for an async build identified by `build_id`.\n\nUse this endpoint to poll the result of an async ingestion or re-process request. The\n`build_id` is returned in the response of:\n\n- `POST /v2/sources/upload` (async file upload)\n- `POST /v2/sources/upload-url-source` (async URL ingestion)\n- `POST /v2/sources/upload-github-source` (async GitHub ingestion)\n- `POST /v2/sources/upload-youtube-source` (async YouTube ingestion)\n- `POST /v2/sources/process` (async re-process)\n\n**Path parameter:**\n- **build_id** (str, required): The build identifier returned when the job was scheduled.\n\n**Query parameters:**\n- **suppress_elements** (bool, default `false`): When `true`, elements are omitted from\n  the response. When `false` (default), the response includes\n  the parsed elements (chunks/partitions) for the build if it completed successfully.\n  Same structure as `POST /sources/elements` (each element has `page_content` and\n  `metadata`). If `page` and `page_size` are not passed, all elements are returned.\n- **suppress_img_base64** (bool, default `false`): When `true`, `img_base64` is omitted\n  from each element (useful to reduce payload size when images are not needed).\n- **page** (int, optional): 1-based page number. Only used when `suppress_elements=false`\n  and pagination is used (pass either `page` or `page_size` to enable pagination).\n- **page_size** (int, optional): Number of elements per page (max 100). Only used\n  when `suppress_elements=false` and pagination is used.\n\n**Response fields:**\n- **build_id**: The requested build identifier.\n- **status**: SourceNodeStatus value when history exists (e.g. Processed, Processing,\n  Processing failed). `not_found` when no history exists (build in progress or invalid id).\n- **success**: `true` when the build completed (status is \"Completed\" or \"Completed with errors\").\n- **file_id**, **file_name**: Source identifiers; present when the build has been\n  persisted (history exists).\n- **error**: Error message from the pipeline when the build failed.\n- **method**, **total_partitions**, **total_pages**: Build metadata when\n  history exists.\n- **created_at**, **updated_at**: ISO8601 timestamps when history exists.\n- **document_annotation**: Document-level summary/annotation from the build history when available.\n- **message**: Human-readable message (e.g. when status is `not_found`).\n- **elements**: List of `{ page_content, metadata }` when `suppress_elements=false`\n  and the build completed successfully.\n- **total_elements**, **page**, **page_size**, **total_pages_elements**: Pagination\n  metadata for `elements` when `suppress_elements=false`.\n\n**Error responses:**\n- `500` — Unexpected internal error.\n\n### Parameters\n\n- `build_id: string`\n\n- `page?: number`\n\n- `page_size?: number`\n\n- `suppress_elements?: boolean`\n\n- `suppress_img_base64?: boolean`\n\n### Returns\n\n- `{ build_id: string; status: string; success: boolean; created_at?: string; document_annotation?: string; elements?: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; error?: string; failed_batches_count?: number; file_id?: string; file_name?: string; has_failed_batches?: boolean; message?: string; method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'; page?: number; page_size?: number; total_elements?: number; total_pages?: number; total_pages_elements?: number; total_partitions?: number; updated_at?: string; }`\n  Status and optional result for an async build (ingestion/re-process) identified by build_id.\n\nReturned by GET /v2/sources/builds/{build_id}. When the build has completed successfully,\nincludes file_id, file_name, and optionally paginated elements (parsed chunks).\n\n  - `build_id: string`\n  - `status: string`\n  - `success: boolean`\n  - `created_at?: string`\n  - `document_annotation?: string`\n  - `elements?: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]`\n  - `error?: string`\n  - `failed_batches_count?: number`\n  - `file_id?: string`\n  - `file_name?: string`\n  - `has_failed_batches?: boolean`\n  - `message?: string`\n  - `method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'`\n  - `page?: number`\n  - `page_size?: number`\n  - `total_elements?: number`\n  - `total_pages?: number`\n  - `total_pages_elements?: number`\n  - `total_partitions?: number`\n  - `updated_at?: string`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.getBuildStatus('build_id');\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.getBuildStatus',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.getBuildStatus('build_id');\n\nconsole.log(response.build_id);",
      },
      python: {
        method: 'sources.get_build_status',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.get_build_status(\n    build_id="build_id",\n)\nprint(response.build_id)',
      },
      go: {
        method: 'client.Sources.GetBuildStatus',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.GetBuildStatus(\n\t\tcontext.TODO(),\n\t\t"build_id",\n\t\tgraphor.SourceGetBuildStatusParams{},\n\t)\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/builds/$BUILD_ID \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY"',
      },
    },
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
    params: ['file: string;', "method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto';"],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## ingest_file\n\n`client.sources.ingestFile(file: string, method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-file`\n\nUpload a local file and schedule ingestion in the background.\n\nAccepts **`multipart/form-data`** with the file. Validates size (max 100 MB) and\nextension, stores the file, then schedules the full data-ingestion pipeline in the\nbackground. Returns immediately with a `build_id` to poll for status.\n\n**Parameters:**\n- **file** (`multipart/form-data`): The file to upload. Must include `Content-Length`\n  and have a supported extension (pdf, doc, docx, csv, txt, md, etc.).\n- **method** (`form`, optional): Partitioning strategy. One of: `fast`,\n  `balanced`, `accurate`, `vlm`, `agentic`. Default when omitted.\n\n**Returns** `AsyncIngestResponse` with `build_id`. Use it to check processing status.\n\n### Parameters\n\n- `file: string`\n\n- `method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'`\n  Public-facing partition method names for API v2.\n\nMaps to internal PartitionMethod as:\n- fast     → basic\n- balanced → hi_res\n- accurate → hi_res_ft\n- agentic  → graphorlm\n- auto     → auto\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestFile({ file: fs.createReadStream('path/to/file') });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.ingestFile',
        example:
          "import fs from 'fs';\nimport Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.ingestFile({ file: fs.createReadStream('path/to/file') });\n\nconsole.log(response.build_id);",
      },
      python: {
        method: 'sources.ingest_file',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.ingest_file(\n    file=b"Example data",\n)\nprint(response.build_id)',
      },
      go: {
        method: 'client.Sources.IngestFile',
        example:
          'package main\n\nimport (\n\t"bytes"\n\t"context"\n\t"fmt"\n\t"io"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.IngestFile(context.TODO(), graphor.SourceIngestFileParams{\n\t\tFile: io.Reader(bytes.NewBuffer([]byte("Example data"))),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n',
      },
      http: {
        example:
          "curl https://api.graphorlm.com/api/public/v1/sources/ingest-file \\\n    -H 'Content-Type: multipart/form-data' \\\n    -H \"Authorization: Bearer $GRAPHOR_API_KEY\" \\\n    -F 'file=@/path/to/file'",
      },
    },
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
      "method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto';",
    ],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## ingest_url\n\n`client.sources.ingestURL(url: string, crawlUrls?: boolean, method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-url`\n\nIngest a web page (or a set of crawled pages) as a source into the project's knowledge graph.\n\nUnlike the synchronous version, this endpoint schedules the ingestion in the background\nand returns immediately with a `processing` status. The source will be fully available\nonce background processing completes.\n\nIf the URL points directly to a downloadable file (detected via URL path extension or\nHTTP Content-Type), the file is first downloaded and uploaded to storage synchronously,\nthen the partition/embedding pipeline runs in the background.\n\n**Parameters (JSON body):**\n- **url** (str, required): The web page URL to ingest.\n- **crawlUrls** (bool, optional, default `false`): When `true`, the system will also\n  follow and ingest links found on the page. Ignored when the URL resolves to a file.\n- **method** (str, optional): The partitioning strategy to use.\n  One of: `fast`, `balanced`, `accurate`, `vlm`, `agentic`. When omitted the system default is applied.\n\n**Returns** a `PublicSourceResponse` with `status: \"processing\"` immediately.\nPoll the source status endpoint using the returned `file_id` to track completion.\n\n**Error responses:**\n- `400` — Unsupported file type detected from a file URL.\n- `500` — Unexpected internal error during URL processing.\n\n### Parameters\n\n- `url: string`\n  The web page URL to ingest\n\n- `crawlUrls?: boolean`\n  When true, also follows and ingests links found on the page\n\n- `method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'`\n  Public-facing partition method names for API v2.\n\nMaps to internal PartitionMethod as:\n- fast     → basic\n- balanced → hi_res\n- accurate → hi_res_ft\n- agentic  → graphorlm\n- auto     → auto\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestURL({ url: 'https://example.com/blog/ai-trends-2025' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.ingestURL',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.ingestURL({ url: 'https://example.com/blog/ai-trends-2025' });\n\nconsole.log(response.build_id);",
      },
      python: {
        method: 'sources.ingest_url',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.ingest_url(\n    url="https://example.com/blog/ai-trends-2025",\n)\nprint(response.build_id)',
      },
      go: {
        method: 'client.Sources.IngestURL',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.IngestURL(context.TODO(), graphor.SourceIngestURLParams{\n\t\tURL: "https://example.com/blog/ai-trends-2025",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/ingest-url \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d \'{\n          "url": "https://example.com/blog/ai-trends-2025",\n          "crawlUrls": false,\n          "method": "balanced"\n        }\'',
      },
    },
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
      "## ingest_github\n\n`client.sources.ingestGitHub(url: string): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-github`\n\nIngest a GitHub repository as a source into the project's knowledge graph.\n\nSchedules the ingestion in the background and returns immediately with a `build_id`.\nUse the returned `build_id` to poll for processing status.\n\n**Parameters (JSON body):**\n- **url** (str, required): The GitHub repository URL to ingest\n  (e.g. `https://github.com/owner/repo`).\n\n**Returns** `AsyncIngestResponse` with `build_id`.\n\n### Parameters\n\n- `url: string`\n  The GitHub repository URL to ingest (e.g. https://github.com/owner/repo)\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestGitHub({ url: 'https://github.com/langchain-ai/langchain' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.ingestGitHub',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.ingestGitHub({\n  url: 'https://github.com/langchain-ai/langchain',\n});\n\nconsole.log(response.build_id);",
      },
      python: {
        method: 'sources.ingest_github',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.ingest_github(\n    url="https://github.com/langchain-ai/langchain",\n)\nprint(response.build_id)',
      },
      go: {
        method: 'client.Sources.IngestGitHub',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.IngestGitHub(context.TODO(), graphor.SourceIngestGitHubParams{\n\t\tURL: "https://github.com/langchain-ai/langchain",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/ingest-github \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d \'{\n          "url": "https://github.com/langchain-ai/langchain"\n        }\'',
      },
    },
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
      "## ingest_youtube\n\n`client.sources.ingestYoutube(url: string): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/ingest-youtube`\n\nIngest a YouTube video as a source into the project's knowledge graph.\n\nSchedules the ingestion in the background and returns immediately with a `build_id`.\nThe endpoint will download the transcript/captions and process them in the background.\nUse the returned `build_id` to poll for processing status.\n\n**Parameters (JSON body):**\n- **url** (str, required): The YouTube video URL to ingest\n  (e.g. `https://www.youtube.com/watch?v=...`).\n\n**Returns** `AsyncIngestResponse` with `build_id`.\n\n### Parameters\n\n- `url: string`\n  The YouTube video URL to ingest (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ingestYoutube({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.ingestYoutube',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.ingestYoutube({\n  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',\n});\n\nconsole.log(response.build_id);",
      },
      python: {
        method: 'sources.ingest_youtube',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.ingest_youtube(\n    url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",\n)\nprint(response.build_id)',
      },
      go: {
        method: 'client.Sources.IngestYoutube',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.IngestYoutube(context.TODO(), graphor.SourceIngestYoutubeParams{\n\t\tURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/ingest-youtube \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d \'{\n          "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"\n        }\'',
      },
    },
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
    params: ['file_id: string;', "method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto';"],
    response: '{ build_id: string; error?: string; success?: boolean; }',
    markdown:
      "## reprocess\n\n`client.sources.reprocess(file_id: string, method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'): { build_id: string; error?: string; success?: boolean; }`\n\n**post** `/sources/reprocess`\n\nRe-process (re-parse) an existing source in the background.\n\nSchedules the data-ingestion pipeline (partitioning, chunking, embedding) for an\nexisting source and returns immediately with a `build_id`. Use it to poll for status.\n\n**Parameters (JSON body):**\n- **file_id** (str, required): Unique identifier of the source to re-process.\n- **method** (str, default `\"fast\"`): Partitioning strategy. One of:\n  `fast`, `balanced`, `accurate`, `vlm`, `agentic`.\n\n**Returns** `AsyncIngestResponse` with `build_id`.\n\n### Parameters\n\n- `file_id: string`\n  Unique identifier of the source to re-process.\n\n- `method?: 'fast' | 'balanced' | 'accurate' | 'agentic' | 'auto'`\n  Partitioning strategy. One of: fast, balanced, accurate, agentic, auto.\n\n### Returns\n\n- `{ build_id: string; error?: string; success?: boolean; }`\n\n  - `build_id: string`\n  - `error?: string`\n  - `success?: boolean`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.reprocess({ file_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.reprocess',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.reprocess({\n  file_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',\n});\n\nconsole.log(response.build_id);",
      },
      python: {
        method: 'sources.reprocess',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.reprocess(\n    file_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",\n)\nprint(response.build_id)',
      },
      go: {
        method: 'client.Sources.Reprocess',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.Reprocess(context.TODO(), graphor.SourceReprocessParams{\n\t\tFileID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/reprocess \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d \'{\n          "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",\n          "method": "balanced"\n        }\'',
      },
    },
  },
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
    perLanguage: {
      typescript: {
        method: 'client.sources.list',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst publicSources = await client.sources.list();\n\nconsole.log(publicSources);",
      },
      python: {
        method: 'sources.list',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\npublic_sources = client.sources.list()\nprint(public_sources)',
      },
      go: {
        method: 'client.Sources.List',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tpublicSources, err := client.Sources.List(context.TODO(), graphor.SourceListParams{})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", publicSources)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY"',
      },
    },
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
    perLanguage: {
      typescript: {
        method: 'client.sources.delete',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst source = await client.sources.delete();\n\nconsole.log(source.project_id);",
      },
      python: {
        method: 'sources.delete',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nsource = client.sources.delete()\nprint(source.project_id)',
      },
      go: {
        method: 'client.Sources.Delete',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tsource, err := client.Sources.Delete(context.TODO(), graphor.SourceDeleteParams{})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", source.ProjectID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/delete \\\n    -X DELETE \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY"',
      },
    },
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
      "thinking_level?: 'fast' | 'balanced' | 'accurate' | 'max';",
    ],
    response: '{ file_names: string[]; file_ids?: string[]; raw_json?: string; structured_output?: object; }',
    markdown:
      "## extract\n\n`client.sources.extract(output_schema: object, user_instruction: string, file_ids?: string[], file_names?: string[], thinking_level?: 'fast' | 'balanced' | 'accurate' | 'max'): { file_names: string[]; file_ids?: string[]; raw_json?: string; structured_output?: object; }`\n\n**post** `/sources/run-extraction`\n\nRun a one-off structured data extraction against one or more sources.\n\nThis endpoint uses the GenAI File Search pipeline to read the specified sources,\napply the user-provided instruction, and return structured JSON output conforming\nto the supplied `output_schema`. Internally it builds a grounded prompt, queries\nthe model, and validates/corrects the raw JSON against the schema.\n\n**Parameters (JSON body):**\n- **file_ids** (list[str], optional — preferred): List of source file IDs to extract\n  from.\n- **file_names** (list[str], optional — deprecated): List of source file names to\n  extract from. Use `file_ids` when possible. At least one of the two lists must be\n  provided and non-empty.\n- **user_instruction** (str, required): A natural-language instruction that guides what\n  information to extract from the documents.\n- **output_schema** (dict, required): A JSON Schema object describing the desired\n  structured output shape. The model will produce data conforming to this schema.\n- **thinking_level** (str, optional, default `\"accurate\"`): Controls the model/thinking\n  budget — one of `\"fast\"`, `\"balanced\"`, or `\"accurate\"`.\n\n**Returns** a `PublicRunExtractionResultResponse` containing:\n- `structured_output` — the validated structured object.\n- `raw_json` — the raw JSON text produced by the model before validation.\n\n**Error responses:**\n- `500` — Unexpected internal error during extraction.\n\n### Parameters\n\n- `output_schema: object`\n  JSON Schema describing the desired structured output shape. The model will produce data conforming to this schema.\n\n- `user_instruction: string`\n  Natural-language instruction guiding what information to extract\n\n- `file_ids?: string[]`\n  List of file IDs to extract from (preferred)\n\n- `file_names?: string[]`\n  List of file names to extract from (deprecated, use file_ids)\n\n- `thinking_level?: 'fast' | 'balanced' | 'accurate' | 'max'`\n  Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', 'accurate', or 'max' (most thorough)\n\n### Returns\n\n- `{ file_names: string[]; file_ids?: string[]; raw_json?: string; structured_output?: object; }`\n\n  - `file_names: string[]`\n  - `file_ids?: string[]`\n  - `raw_json?: string`\n  - `structured_output?: object`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.extract({\n  output_schema: { properties: 'bar', type: 'bar' },\n  user_instruction: 'Extract all invoice line items including product name, quantity, unit price, and total.',\n});\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.extract',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.extract({\n  output_schema: { properties: 'bar', type: 'bar' },\n  user_instruction:\n    'Extract all invoice line items including product name, quantity, unit price, and total.',\n});\n\nconsole.log(response.file_ids);",
      },
      python: {
        method: 'sources.extract',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.extract(\n    output_schema={\n        "properties": "bar",\n        "type": "bar",\n    },\n    user_instruction="Extract all invoice line items including product name, quantity, unit price, and total.",\n)\nprint(response.file_ids)',
      },
      go: {
        method: 'client.Sources.Extract',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.Extract(context.TODO(), graphor.SourceExtractParams{\n\t\tOutputSchema: map[string]any{\n\t\t\t"properties": "bar",\n\t\t\t"type":       "bar",\n\t\t},\n\t\tUserInstruction: "Extract all invoice line items including product name, quantity, unit price, and total.",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.FileIDs)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/run-extraction \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d \'{\n          "output_schema": {\n            "properties": "bar",\n            "type": "bar"\n          },\n          "user_instruction": "Extract all invoice line items including product name, quantity, unit price, and total.",\n          "file_ids": [\n            "a1b2c3d4-e5f6-7890-abcd-ef1234567890"\n          ],\n          "file_names": [\n            "contract-draft.docx"\n          ],\n          "thinking_level": "accurate"\n        }\'',
      },
    },
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
      'include_citation_images?: boolean;',
      'include_citation_markup?: boolean;',
      'output_schema?: object;',
      'reset?: boolean;',
      "thinking_level?: 'fast' | 'balanced' | 'accurate' | 'max';",
    ],
    response:
      '{ answer: string; citations?: { element_id?: string; file_id?: string; file_name?: string; image_base64?: string; index?: number; page_number?: number; section_number?: number; text_preview?: string; }[]; conversation_id?: string; elapsed_s?: number; raw_json?: string; structured_output?: object; usage?: { cache_read_tokens?: number; cache_write_tokens?: number; om_tokens_in?: number; om_tokens_out?: number; tokens_in?: number; tokens_out?: number; }; }',
    markdown:
      "## ask\n\n`client.sources.ask(question: string, conversation_id?: string, file_ids?: string[], file_names?: string[], include_citation_images?: boolean, include_citation_markup?: boolean, output_schema?: object, reset?: boolean, thinking_level?: 'fast' | 'balanced' | 'accurate' | 'max'): { answer: string; citations?: object[]; conversation_id?: string; elapsed_s?: number; raw_json?: string; structured_output?: object; usage?: object; }`\n\n**post** `/sources/ask-sources`\n\nAsk a natural-language question grounded on the project's ingested sources.\n\nThis is the primary Q&A endpoint. It sends the question through the GenAI File Search\npipeline, which retrieves relevant chunks from the knowledge graph, grounds the answer\nin the source documents, and returns a natural-language response. Optionally, you can\nrequest a structured JSON output by supplying an `output_schema`.\n\nConversation memory is supported: pass a `conversation_id` to continue an existing\nconversation, or set `reset` to `true` to start fresh.\n\n**Parameters (JSON body):**\n- **question** (str, required): The question to ask about the sources.\n- **conversation_id** (str, optional): An existing conversation identifier to maintain\n  context across multiple turns.\n- **reset** (bool, optional, default `false`): When `true`, starts a new conversation\n  discarding any previous history.\n- **file_ids** (list[str], optional — preferred): Restrict the search scope to specific\n  source file IDs.\n- **file_names** (list[str], optional — deprecated): Restrict the search scope to\n  specific source file names. Use `file_ids` when possible.\n- **output_schema** (dict, optional): A JSON Schema for requesting structured output.\n  When provided, the response includes a `structured_output` field validated against\n  this schema and the `raw_json` produced by the model.\n- **thinking_level** (str, optional, default `\"accurate\"`): Controls the model/thinking\n  budget — one of `\"fast\"`, `\"balanced\"`, or `\"accurate\"`.\n\n**Returns** a `PublicAskSourcesResponse` containing:\n- `answer` — the natural-language answer (or a status message when `output_schema` is\n  provided).\n- `structured_output` — the validated structured object (when `output_schema` is\n  provided).\n- `raw_json` — the raw JSON text before validation (when `output_schema` is provided).\n- `conversation_id` — the conversation identifier for follow-up questions.\n\n**Error responses:**\n- `500` — Unexpected internal error while asking sources.\n\n### Parameters\n\n- `question: string`\n  The natural-language question to ask about the sources\n\n- `conversation_id?: string`\n  Conversation identifier to maintain memory context across multiple turns\n\n- `file_ids?: string[]`\n  Optional list of file IDs to restrict search scope (preferred)\n\n- `file_names?: string[]`\n  Optional list of file display names to restrict search scope (deprecated, use file_ids)\n\n- `include_citation_images?: boolean`\n  When true, the response's ``citations`` entries are populated with a base64-encoded PNG screenshot of each cited page in ``image_base64``. Increases payload size and latency — leave false (the default) when not needed and fetch screenshots on demand via `GET /sources/{file_id}/pages/{page_number}/screenshot`.\n\n- `include_citation_markup?: boolean`\n  When true, the ``answer`` field keeps the structured citation markup ``[N](file_id|pX|sY|eZ|fNAME)`` emitted by the agent. When false (default), the markup is stripped to plain ``[N]`` markers and the structured data is exposed via ``citations`` instead. Note: the markup format is an implementation detail and may change in future versions — prefer the ``citations`` field for stable parsing. Has no effect when ``output_schema`` is set.\n\n- `output_schema?: object`\n  Optional JSON Schema for requesting structured output. When provided, the answer field will contain a short status message and the structured data will be in structured_output.\n\n- `reset?: boolean`\n  When true, starts a new conversation discarding any previous history\n\n- `thinking_level?: 'fast' | 'balanced' | 'accurate' | 'max'`\n  Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', 'accurate', or 'max' (most thorough)\n\n### Returns\n\n- `{ answer: string; citations?: { element_id?: string; file_id?: string; file_name?: string; image_base64?: string; index?: number; page_number?: number; section_number?: number; text_preview?: string; }[]; conversation_id?: string; elapsed_s?: number; raw_json?: string; structured_output?: object; usage?: { cache_read_tokens?: number; cache_write_tokens?: number; om_tokens_in?: number; om_tokens_out?: number; tokens_in?: number; tokens_out?: number; }; }`\n\n  - `answer: string`\n  - `citations?: { element_id?: string; file_id?: string; file_name?: string; image_base64?: string; index?: number; page_number?: number; section_number?: number; text_preview?: string; }[]`\n  - `conversation_id?: string`\n  - `elapsed_s?: number`\n  - `raw_json?: string`\n  - `structured_output?: object`\n  - `usage?: { cache_read_tokens?: number; cache_write_tokens?: number; om_tokens_in?: number; om_tokens_out?: number; tokens_in?: number; tokens_out?: number; }`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.ask({ question: 'What was the company\\'s revenue in 2025?' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.ask',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.ask({ question: \"What was the company's revenue in 2025?\" });\n\nconsole.log(response.conversation_id);",
      },
      python: {
        method: 'sources.ask',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.ask(\n    question="What was the company\'s revenue in 2025?",\n)\nprint(response.conversation_id)',
      },
      go: {
        method: 'client.Sources.Ask',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.Ask(context.TODO(), graphor.SourceAskParams{\n\t\tQuestion: "What was the company\'s revenue in 2025?",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.ConversationID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/ask-sources \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d "{\n          \\"question\\": \\"What was the company\'s revenue in 2025?\\",\n          \\"conversation_id\\": \\"conv-9f8e7d6c-5b4a-3210-fedc-ba0987654321\\",\n          \\"file_ids\\": [\n            \\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\\"\n          ],\n          \\"include_citation_images\\": true,\n          \\"output_schema\\": {\n            \\"properties\\": \\"bar\\",\n            \\"type\\": \\"bar\\"\n          },\n          \\"reset\\": true,\n          \\"thinking_level\\": \\"accurate\\"\n        }"',
      },
    },
  },
  {
    name: 'get_page_screenshot',
    endpoint: '/sources/{file_id}/pages/{page_number}/screenshot',
    httpMethod: 'get',
    summary: 'Get a base64 screenshot of a source page',
    description:
      'Render a single page of a source file as a base64-encoded PNG screenshot.\n\nUse this endpoint to lazily fetch the visual preview of a citation returned\nby `/ask-sources` without paying the payload cost of inlining base64 in the\nanswer.  Supports PDFs, image files (`page_number` must be 1), and Office\ndocuments (doc/docx/ppt/pptx/odt — rendered from the converted PDF).\n\n**Path parameters:**\n- **file_id** (str): UUID of the source file.\n- **page_number** (int): 1-based page number.\n\n**Query parameters:**\n- **max_width** (int, optional, default `900`): Pixel width cap. Clamped to\n  the 300-1600 range.\n\n**Returns** a `PublicPageScreenshotResponse` containing:\n- `file_id`, `file_name`, `page_number` — identifying metadata.\n- `mime_type` — always `"image/png"`.\n- `width`, `height` — rendered image dimensions in pixels.\n- `image_base64` — the base64-encoded PNG bytes.\n\n**Error responses:**\n- `404` — File not found, unsupported file type, or invalid page number.\n- `500` — Unexpected internal error while rendering.',
    stainlessPath: '(resource) sources > (method) get_page_screenshot',
    qualified: 'client.sources.getPageScreenshot',
    params: ['file_id: string;', 'page_number: number;', 'max_width?: number;'],
    response:
      '{ file_id: string; image_base64: string; page_number: number; file_name?: string; height?: number; mime_type?: string; width?: number; }',
    markdown:
      "## get_page_screenshot\n\n`client.sources.getPageScreenshot(file_id: string, page_number: number, max_width?: number): { file_id: string; image_base64: string; page_number: number; file_name?: string; height?: number; mime_type?: string; width?: number; }`\n\n**get** `/sources/{file_id}/pages/{page_number}/screenshot`\n\nRender a single page of a source file as a base64-encoded PNG screenshot.\n\nUse this endpoint to lazily fetch the visual preview of a citation returned\nby `/ask-sources` without paying the payload cost of inlining base64 in the\nanswer.  Supports PDFs, image files (`page_number` must be 1), and Office\ndocuments (doc/docx/ppt/pptx/odt — rendered from the converted PDF).\n\n**Path parameters:**\n- **file_id** (str): UUID of the source file.\n- **page_number** (int): 1-based page number.\n\n**Query parameters:**\n- **max_width** (int, optional, default `900`): Pixel width cap. Clamped to\n  the 300-1600 range.\n\n**Returns** a `PublicPageScreenshotResponse` containing:\n- `file_id`, `file_name`, `page_number` — identifying metadata.\n- `mime_type` — always `\"image/png\"`.\n- `width`, `height` — rendered image dimensions in pixels.\n- `image_base64` — the base64-encoded PNG bytes.\n\n**Error responses:**\n- `404` — File not found, unsupported file type, or invalid page number.\n- `500` — Unexpected internal error while rendering.\n\n### Parameters\n\n- `file_id: string`\n\n- `page_number: number`\n\n- `max_width?: number`\n  Pixel width cap for the rendered image (clamped to 300-1600).\n\n### Returns\n\n- `{ file_id: string; image_base64: string; page_number: number; file_name?: string; height?: number; mime_type?: string; width?: number; }`\n  Base64-encoded PNG screenshot of a page from a source file.\n\n  - `file_id: string`\n  - `image_base64: string`\n  - `page_number: number`\n  - `file_name?: string`\n  - `height?: number`\n  - `mime_type?: string`\n  - `width?: number`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.getPageScreenshot(0, { file_id: 'file_id' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.getPageScreenshot',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.getPageScreenshot(0, { file_id: 'file_id' });\n\nconsole.log(response.file_id);",
      },
      python: {
        method: 'sources.get_page_screenshot',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.get_page_screenshot(\n    page_number=0,\n    file_id="file_id",\n)\nprint(response.file_id)',
      },
      go: {
        method: 'client.Sources.GetPageScreenshot',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.GetPageScreenshot(\n\t\tcontext.TODO(),\n\t\t0,\n\t\tgraphor.SourceGetPageScreenshotParams{\n\t\t\tFileID: "file_id",\n\t\t},\n\t)\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.FileID)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/$FILE_ID/pages/$PAGE_NUMBER/screenshot \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY"',
      },
    },
  },
  {
    name: 'get_elements',
    endpoint: '/sources/get-elements',
    httpMethod: 'get',
    summary: 'Get parsed elements of a source (v2 format)',
    description:
      'Retrieve the parsed elements (chunks/partitions) of a source in the same format as get_build_status.\n\nReturns elements with explicit fields: element_id, element_type, text, markdown, html,\nimg_base64 (optional), position, page_number, bounding_box, page_layout, etc.\n\n**Query parameters:**\n- **file_id** (str, required): Unique identifier of the source.\n- **page** (int, optional): 1-based page number. Use with page_size to enable pagination.\n- **page_size** (int, optional): Number of elements per page (max 100).\n- **suppress_img_base64** (bool, default false): When true, img_base64 is omitted from each element.\n- **type** (str, optional): Filter by element type (e.g. NarrativeText, Title, Table).\n- **page_numbers** (list, optional): Restrict to specific page numbers (repeat param for multiple).\n- **element_ids** (list, optional): Restrict to specific partition element_ids (repeat param for multiple).\n- **elementsToRemove** (list, optional): Element types to exclude (repeat param for multiple).\n\n**Returns** Paginated response with items as BuildStatusElement list (same shape as GET /builds/{build_id} elements).',
    stainlessPath: '(resource) sources > (method) get_elements',
    qualified: 'client.sources.getElements',
    params: [
      'file_id: string;',
      'element_ids?: string[];',
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
      "## get_elements\n\n`client.sources.getElements(file_id: string, element_ids?: string[], elementsToRemove?: string[], page?: number, page_numbers?: number[], page_size?: number, suppress_img_base64?: boolean, type?: string): { items: element[]; total: number; page?: number; page_size?: number; total_pages?: number; }`\n\n**get** `/sources/get-elements`\n\nRetrieve the parsed elements (chunks/partitions) of a source in the same format as get_build_status.\n\nReturns elements with explicit fields: element_id, element_type, text, markdown, html,\nimg_base64 (optional), position, page_number, bounding_box, page_layout, etc.\n\n**Query parameters:**\n- **file_id** (str, required): Unique identifier of the source.\n- **page** (int, optional): 1-based page number. Use with page_size to enable pagination.\n- **page_size** (int, optional): Number of elements per page (max 100).\n- **suppress_img_base64** (bool, default false): When true, img_base64 is omitted from each element.\n- **type** (str, optional): Filter by element type (e.g. NarrativeText, Title, Table).\n- **page_numbers** (list, optional): Restrict to specific page numbers (repeat param for multiple).\n- **element_ids** (list, optional): Restrict to specific partition element_ids (repeat param for multiple).\n- **elementsToRemove** (list, optional): Element types to exclude (repeat param for multiple).\n\n**Returns** Paginated response with items as BuildStatusElement list (same shape as GET /builds/{build_id} elements).\n\n### Parameters\n\n- `file_id: string`\n  Unique identifier of the source\n\n- `element_ids?: string[]`\n  Restrict to specific element IDs (repeat param for multiple)\n\n- `elementsToRemove?: string[]`\n  Element types to exclude\n\n- `page?: number`\n  1-based page number (use with page_size)\n\n- `page_numbers?: number[]`\n  Restrict to specific page numbers\n\n- `page_size?: number`\n  Number of elements per page\n\n- `suppress_img_base64?: boolean`\n  When true, img_base64 is omitted from each element\n\n- `type?: string`\n  Filter by element type (e.g. NarrativeText, Title)\n\n### Returns\n\n- `{ items: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]; total: number; page?: number; page_size?: number; total_pages?: number; }`\n\n  - `items: { bounding_box?: object; element_id?: string; element_type?: string; html?: string; img_base64?: string; markdown?: string; metadata?: object; page_annotation?: string; page_keywords?: string[]; page_layout?: object; page_number?: number; page_topics?: string[]; position?: number; text?: string; }[]`\n  - `total: number`\n  - `page?: number`\n  - `page_size?: number`\n  - `total_pages?: number`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.getElements({ file_id: 'file_id' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.getElements',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.getElements({ file_id: 'file_id' });\n\nconsole.log(response.items);",
      },
      python: {
        method: 'sources.get_elements',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.get_elements(\n    file_id="file_id",\n)\nprint(response.items)',
      },
      go: {
        method: 'client.Sources.GetElements',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.GetElements(context.TODO(), graphor.SourceGetElementsParams{\n\t\tFileID: "file_id",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.Items)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/get-elements \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY"',
      },
    },
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
      "## retrieve_chunks\n\n`client.sources.retrieveChunks(query: string, file_ids?: string[], file_names?: string[]): { query: string; total: number; chunks?: object[]; }`\n\n**post** `/sources/prebuilt-rag`\n\nRetrieve relevant document chunks from the prebuilt RAG vector store.\n\nPerforms a semantic similarity search over the project's prebuilt RAG store using\nGoogle File Search with grounding. Returns the most relevant text chunks along with\ntheir source metadata (file name, page number, relevance score). This is a pure\nretrieval endpoint — it does **not** generate an answer; use `/ask-sources` for Q&A.\n\n**Parameters (JSON body):**\n- **query** (str, required): The natural-language search query used to find relevant\n  chunks.\n- **file_ids** (list[str], optional — preferred): Restrict retrieval to specific source\n  file IDs.\n- **file_names** (list[str], optional — deprecated): Restrict retrieval to specific\n  source file names. Use `file_ids` when possible.\n\n**Returns** a `PublicRetrieveResponse` containing:\n- `query` — the original search query.\n- `chunks` — a list of `PublicRetrieveChunk` objects, each with `text`,\n  `file_name`, `page_number`, `score`, and additional `metadata`.\n- `total` — the total number of chunks returned.\n\n**Error responses:**\n- `500` — Unexpected internal error during retrieval.\n\n### Parameters\n\n- `query: string`\n  The natural-language search query to find relevant chunks\n\n- `file_ids?: string[]`\n  Optional list of file IDs to restrict retrieval scope (preferred)\n\n- `file_names?: string[]`\n  Optional list of file names to restrict retrieval scope (deprecated, use file_ids)\n\n### Returns\n\n- `{ query: string; total: number; chunks?: { text: string; file_id?: string; file_name?: string; metadata?: object; page_number?: number; score?: number; }[]; }`\n\n  - `query: string`\n  - `total: number`\n  - `chunks?: { text: string; file_id?: string; file_name?: string; metadata?: object; page_number?: number; score?: number; }[]`\n\n### Example\n\n```typescript\nimport Graphor from 'graphor';\n\nconst client = new Graphor();\n\nconst response = await client.sources.retrieveChunks({ query: 'What was the company\\'s net income in 2025?' });\n\nconsole.log(response);\n```",
    perLanguage: {
      typescript: {
        method: 'client.sources.retrieveChunks',
        example:
          "import Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.retrieveChunks({\n  query: \"What was the company's net income in 2025?\",\n});\n\nconsole.log(response.query);",
      },
      python: {
        method: 'sources.retrieve_chunks',
        example:
          'import os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.sources.retrieve_chunks(\n    query="What was the company\'s net income in 2025?",\n)\nprint(response.query)',
      },
      go: {
        method: 'client.Sources.GetChunks',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"),\n\t)\n\tresponse, err := client.Sources.GetChunks(context.TODO(), graphor.SourceGetChunksParams{\n\t\tQuery: "What was the company\'s net income in 2025?",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.Query)\n}\n',
      },
      http: {
        example:
          'curl https://api.graphorlm.com/api/public/v1/sources/prebuilt-rag \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $GRAPHOR_API_KEY" \\\n    -d "{\n          \\"query\\": \\"What was the company\'s net income in 2025?\\",\n          \\"file_ids\\": [\n            \\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\\",\n            \\"b2c3d4e5-f6a7-8901-bcde-f12345678901\\"\n          ]\n        }"',
      },
    },
  },
];

const EMBEDDED_READMES: { language: string; content: string }[] = [
  {
    language: 'go',
    content:
      '# Graphor Go API Library\n\n<a href="https://pkg.go.dev/github.com/stainless-sdks/graphor-prd-go"><img src="https://pkg.go.dev/badge/github.com/stainless-sdks/graphor-prd-go.svg" alt="Go Reference"></a>\n\nThe Graphor Go library provides convenient access to the [Graphor REST API](https://docs.graphorlm.com)\nfrom applications written in Go.\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Graphor MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=graphor-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdyYXBob3ItbWNwIl0sImVudiI6eyJHUkFQSE9SX0FQSV9LRVkiOiJNeSBBUEkgS2V5In19)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22graphor-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22graphor-mcp%22%5D%2C%22env%22%3A%7B%22GRAPHOR_API_KEY%22%3A%22My%20API%20Key%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Installation\n\n\n\n```go\nimport (\n\t"github.com/stainless-sdks/graphor-prd-go" // imported as SDK_PackageName\n)\n```\n\n\n\nOr to pin the version:\n\n\n\n```sh\ngo get -u \'github.com/stainless-sdks/graphor-prd-go@v0.0.1\'\n```\n\n\n\n## Requirements\n\nThis library requires Go 1.22+.\n\n## Usage\n\nThe full API of this library can be found in [api.md](api.md).\n\n```go\npackage main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/stainless-sdks/graphor-prd-go"\n\t"github.com/stainless-sdks/graphor-prd-go/option"\n)\n\nfunc main() {\n\tclient := graphor.NewClient(\n\t\toption.WithAPIKey("My API Key"), // defaults to os.LookupEnv("GRAPHOR_API_KEY")\n\t)\n\tresponse, err := client.Sources.IngestURL(context.TODO(), graphor.SourceIngestURLParams{\n\t\tURL: "https://example.com/blog/ai-trends-2025",\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.BuildID)\n}\n\n```\n\n### Request fields\n\nAll request parameters are wrapped in a generic `Field` type,\nwhich we use to distinguish zero values from null or omitted fields.\n\nThis prevents accidentally sending a zero value if you forget a required parameter,\nand enables explicitly sending `null`, `false`, `\'\'`, or `0` on optional parameters.\nAny field not specified is not sent.\n\nTo construct fields with values, use the helpers `String()`, `Int()`, `Float()`, or most commonly, the generic `F[T]()`.\nTo send a null, use `Null[T]()`, and to send a nonconforming value, use `Raw[T](any)`. For example:\n\n```go\nparams := FooParams{\n\tName: SDK_PackageName.F("hello"),\n\n\t// Explicitly send `"description": null`\n\tDescription: SDK_PackageName.Null[string](),\n\n\tPoint: SDK_PackageName.F(SDK_PackageName.Point{\n\t\tX: SDK_PackageName.Int(0),\n\t\tY: SDK_PackageName.Int(1),\n\n\t\t// In cases where the API specifies a given type,\n\t\t// but you want to send something else, use `Raw`:\n\t\tZ: SDK_PackageName.Raw[int64](0.01), // sends a float\n\t}),\n}\n```\n\n### Response objects\n\nAll fields in response structs are value types (not pointers or wrappers).\n\nIf a given field is `null`, not present, or invalid, the corresponding field\nwill simply be its zero value.\n\nAll response structs also include a special `JSON` field, containing more detailed\ninformation about each property, which you can use like so:\n\n```go\nif res.Name == "" {\n\t// true if `"name"` is either not present or explicitly null\n\tres.JSON.Name.IsNull()\n\n\t// true if the `"name"` key was not present in the response JSON at all\n\tres.JSON.Name.IsMissing()\n\n\t// When the API returns data that cannot be coerced to the expected type:\n\tif res.JSON.Name.IsInvalid() {\n\t\traw := res.JSON.Name.Raw()\n\n\t\tlegacyName := struct{\n\t\t\tFirst string `json:"first"`\n\t\t\tLast  string `json:"last"`\n\t\t}{}\n\t\tjson.Unmarshal([]byte(raw), &legacyName)\n\t\tname = legacyName.First + " " + legacyName.Last\n\t}\n}\n```\n\nThese `.JSON` structs also include an `Extras` map containing\nany properties in the json response that were not specified\nin the struct. This can be useful for API features not yet\npresent in the SDK.\n\n```go\nbody := res.JSON.ExtraFields["my_unexpected_field"].Raw()\n```\n\n### RequestOptions\n\nThis library uses the functional options pattern. Functions defined in the\n`SDK_PackageOptionName` package return a `RequestOption`, which is a closure that mutates a\n`RequestConfig`. These options can be supplied to the client or at individual\nrequests. For example:\n\n```go\nclient := SDK_PackageName.SDK_ClientInitializerName(\n\t// Adds a header to every request made by the client\n\tSDK_PackageOptionName.WithHeader("X-Some-Header", "custom_header_info"),\n)\n\nclient.Sources.IngestURL(context.TODO(), ...,\n\t// Override the header\n\tSDK_PackageOptionName.WithHeader("X-Some-Header", "some_other_custom_header_info"),\n\t// Add an undocumented field to the request body, using sjson syntax\n\tSDK_PackageOptionName.WithJSONSet("some.json.path", map[string]string{"my": "object"}),\n)\n```\n\nSee the [full list of request options](https://pkg.go.dev/github.com/stainless-sdks/graphor-prd-go/SDK_PackageOptionName).\n\n### Pagination\n\nThis library provides some conveniences for working with paginated list endpoints.\n\nYou can use `.ListAutoPaging()` methods to iterate through items across all pages:\n\n\n\nOr you can use simple `.List()` methods to fetch a single page and receive a standard response object\nwith additional helper methods like `.GetNextPage()`, e.g.:\n\n\n\n### Errors\n\nWhen the API returns a non-success status code, we return an error with type\n`*SDK_PackageName.Error`. This contains the `StatusCode`, `*http.Request`, and\n`*http.Response` values of the request, as well as the JSON of the error body\n(much like other response objects in the SDK).\n\nTo handle errors, we recommend that you use the `errors.As` pattern:\n\n```go\n_, err := client.Sources.IngestURL(context.TODO(), graphor.SourceIngestURLParams{\n\tURL: "https://example.com/blog/ai-trends-2025",\n})\nif err != nil {\n\tvar apierr *graphor.Error\n\tif errors.As(err, &apierr) {\n\t\tprintln(string(apierr.DumpRequest(true)))  // Prints the serialized HTTP request\n\t\tprintln(string(apierr.DumpResponse(true))) // Prints the serialized HTTP response\n\t}\n\tpanic(err.Error()) // GET "/sources/ingest-url": 400 Bad Request { ... }\n}\n```\n\nWhen other errors occur, they are returned unwrapped; for example,\nif HTTP transport fails, you might receive `*url.Error` wrapping `*net.OpError`.\n\n### Timeouts\n\nRequests do not time out by default; use context to configure a timeout for a request lifecycle.\n\nNote that if a request is [retried](#retries), the context timeout does not start over.\nTo set a per-retry timeout, use `SDK_PackageOptionName.WithRequestTimeout()`.\n\n```go\n// This sets the timeout for the request, including all the retries.\nctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)\ndefer cancel()\nclient.Sources.IngestURL(\n\tctx,\n\tgraphor.SourceIngestURLParams{\n\t\tURL: "https://example.com/blog/ai-trends-2025",\n\t},\n\t// This sets the per-retry timeout\n\toption.WithRequestTimeout(20*time.Second),\n)\n```\n\n### File uploads\n\nRequest parameters that correspond to file uploads in multipart requests are typed as\n`param.Field[io.Reader]`. The contents of the `io.Reader` will by default be sent as a multipart form\npart with the file name of "anonymous_file" and content-type of "application/octet-stream".\n\nThe file name and content-type can be customized by implementing `Name() string` or `ContentType()\nstring` on the run-time type of `io.Reader`. Note that `os.File` implements `Name() string`, so a\nfile returned by `os.Open` will be sent with the file name on disk.\n\nWe also provide a helper `SDK_PackageName.FileParam(reader io.Reader, filename string, contentType string)`\nwhich can be used to wrap any `io.Reader` with the appropriate file name and content type.\n\n```go\n// A file from the file system\nfile, err := os.Open("/path/to/file")\ngraphor.SourceIngestFileParams{\n\tFile: file,\n}\n\n// A file from a string\ngraphor.SourceIngestFileParams{\n\tFile: strings.NewReader("my file contents"),\n}\n\n// With a custom filename and contentType\ngraphor.SourceIngestFileParams{\n\tFile: graphor.File(strings.NewReader(`{"hello": "foo"}`), "file.go", "application/json"),\n}\n```\n\n### Retries\n\nCertain errors will be automatically retried 0 times by default, with a short exponential backoff.\nWe retry by default all connection errors, 408 Request Timeout, 409 Conflict, 429 Rate Limit,\nand >=500 Internal errors.\n\nYou can use the `WithMaxRetries` option to configure or disable this:\n\n```go\n// Configure the default for all requests:\nclient := graphor.NewClient(\n\toption.WithMaxRetries(0), // default is 2\n)\n\n// Override per-request:\nclient.Sources.IngestURL(\n\tcontext.TODO(),\n\tgraphor.SourceIngestURLParams{\n\t\tURL: "https://example.com/blog/ai-trends-2025",\n\t},\n\toption.WithMaxRetries(5),\n)\n```\n\n\n### Accessing raw response data (e.g. response headers)\n\nYou can access the raw HTTP response data by using the `option.WithResponseInto()` request option. This is useful when\nyou need to examine response headers, status codes, or other details.\n\n```go\n// Create a variable to store the HTTP response\nvar response *http.Response\nresponse, err := client.Sources.IngestURL(\n\tcontext.TODO(),\n\tgraphor.SourceIngestURLParams{\n\t\tURL: "https://example.com/blog/ai-trends-2025",\n\t},\n\toption.WithResponseInto(&response),\n)\nif err != nil {\n\t// handle error\n}\nfmt.Printf("%+v\\n", response)\n\nfmt.Printf("Status Code: %d\\n", response.StatusCode)\nfmt.Printf("Headers: %+#v\\n", response.Header)\n```\n\n### Making custom/undocumented requests\n\nThis library is typed for convenient access to the documented API. If you need to access undocumented\nendpoints, params, or response properties, the library can still be used.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints, you can use `client.Get`, `client.Post`, and other HTTP verbs.\n`RequestOptions` on the client, such as retries, will be respected when making these requests.\n\n```go\nvar (\n    // params can be an io.Reader, a []byte, an encoding/json serializable object,\n    // or a "…Params" struct defined in this library.\n    params map[string]interface{}\n\n    // result can be an []byte, *http.Response, a encoding/json deserializable object,\n    // or a model defined in this library.\n    result *http.Response\n)\nerr := client.Post(context.Background(), "/unspecified", params, &result)\nif err != nil {\n    …\n}\n```\n\n#### Undocumented request params\n\nTo make requests using undocumented parameters, you may use either the `SDK_PackageOptionName.WithQuerySet()`\nor the `SDK_PackageOptionName.WithJSONSet()` methods.\n\n```go\nparams := FooNewParams{\n    ID:   SDK_PackageName.F("id_xxxx"),\n    Data: SDK_PackageName.F(FooNewParamsData{\n        FirstName: SDK_PackageName.F("John"),\n    }),\n}\nclient.Foo.New(context.Background(), params, SDK_PackageOptionName.WithJSONSet("data.last_name", "Doe"))\n```\n\n#### Undocumented response properties\n\nTo access undocumented response properties, you may either access the raw JSON of the response as a string\nwith `result.JSON.RawJSON()`, or get the raw JSON of a particular field on the result with\n`result.JSON.Foo.Raw()`.\n\nAny fields that are not present on the response struct will be saved and can be accessed by `result.JSON.ExtraFields()` which returns the extra fields as a `map[string]Field`.\n\n### Middleware\n\nWe provide `SDK_PackageOptionName.WithMiddleware` which applies the given\nmiddleware to requests.\n\n```go\nfunc Logger(req *http.Request, next SDK_PackageOptionName.MiddlewareNext) (res *http.Response, err error) {\n\t// Before the request\n\tstart := time.Now()\n\tLogReq(req)\n\n\t// Forward the request to the next handler\n\tres, err = next(req)\n\n\t// Handle stuff after the request\n\tend := time.Now()\n\tLogRes(res, err, start - end)\n\n    return res, err\n}\n\nclient := SDK_PackageName.SDK_ClientInitializerName(\n\tSDK_PackageOptionName.WithMiddleware(Logger),\n)\n```\n\nWhen multiple middlewares are provided as variadic arguments, the middlewares\nare applied left to right. If `SDK_PackageOptionName.WithMiddleware` is given\nmultiple times, for example first in the client then the method, the\nmiddleware in the client will run first and the middleware given in the method\nwill run next.\n\nYou may also replace the default `http.Client` with\n`SDK_PackageOptionName.WithHTTPClient(client)`. Only one http client is\naccepted (this overwrites any previous client) and receives requests after any\nmiddleware has been applied.\n\n## Semantic versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n2. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/stainless-sdks/graphor-prd-go/issues) with questions, bugs, or suggestions.\n\n## Contributing\n\nSee [the contributing documentation](./CONTRIBUTING.md).\n',
  },
  {
    language: 'python',
    content:
      '# Graphor Python API library\n\n<!-- prettier-ignore -->\n[![PyPI version](https://img.shields.io/pypi/v/graphor.svg?label=pypi%20(stable))](https://pypi.org/project/graphor/)\n\nThe Graphor Python library provides convenient access to the Graphor REST API from any Python 3.9+\napplication. The library includes type definitions for all request params and response fields,\nand offers both synchronous and asynchronous clients powered by [httpx](https://github.com/encode/httpx).\n\n\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Graphor MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=graphor-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdyYXBob3ItbWNwIl0sImVudiI6eyJHUkFQSE9SX0FQSV9LRVkiOiJNeSBBUEkgS2V5In19)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22graphor-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22graphor-mcp%22%5D%2C%22env%22%3A%7B%22GRAPHOR_API_KEY%22%3A%22My%20API%20Key%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Documentation\n\nThe REST API documentation can be found on [docs.graphorlm.com](https://docs.graphorlm.com). The full API of this library can be found in [api.md](api.md).\n\n## Installation\n\n```sh\n# install from PyPI\npip install graphor\n```\n\n## Usage\n\nThe full API of this library can be found in [api.md](api.md).\n\n```python\nimport os\nfrom graphor import Graphor\n\nclient = Graphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\n\nresponse = client.sources.ingest_url(\n    url="https://example.com/blog/ai-trends-2025",\n)\nprint(response.build_id)\n```\n\nWhile you can provide an `api_key` keyword argument,\nwe recommend using [python-dotenv](https://pypi.org/project/python-dotenv/)\nto add `GRAPHOR_API_KEY="My API Key"` to your `.env` file\nso that your API Key is not stored in source control.\n\n## Async usage\n\nSimply import `AsyncGraphor` instead of `Graphor` and use `await` with each API call:\n\n```python\nimport os\nimport asyncio\nfrom graphor import AsyncGraphor\n\nclient = AsyncGraphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n)\n\nasync def main() -> None:\n  response = await client.sources.ingest_url(\n      url="https://example.com/blog/ai-trends-2025",\n  )\n  print(response.build_id)\n\nasyncio.run(main())\n```\n\nFunctionality between the synchronous and asynchronous clients is otherwise identical.\n\n### With aiohttp\n\nBy default, the async client uses `httpx` for HTTP requests. However, for improved concurrency performance you may also use `aiohttp` as the HTTP backend.\n\nYou can enable this by installing `aiohttp`:\n\n```sh\n# install from PyPI\npip install graphor[aiohttp]\n```\n\nThen you can enable it by instantiating the client with `http_client=DefaultAioHttpClient()`:\n\n```python\nimport os\nimport asyncio\nfrom graphor import DefaultAioHttpClient\nfrom graphor import AsyncGraphor\n\nasync def main() -> None:\n  async with AsyncGraphor(\n    api_key=os.environ.get("GRAPHOR_API_KEY"),  # This is the default and can be omitted\n    http_client=DefaultAioHttpClient(),\n) as client:\n    response = await client.sources.ingest_url(\n        url="https://example.com/blog/ai-trends-2025",\n    )\n    print(response.build_id)\n\nasyncio.run(main())\n```\n\n\n\n## Using types\n\nNested request parameters are [TypedDicts](https://docs.python.org/3/library/typing.html#typing.TypedDict). Responses are [Pydantic models](https://docs.pydantic.dev) which also provide helper methods for things like:\n\n- Serializing back into JSON, `model.to_json()`\n- Converting to a dictionary, `model.to_dict()`\n\nTyped requests and responses provide autocomplete and documentation within your editor. If you would like to see type errors in VS Code to help catch bugs earlier, set `python.analysis.typeCheckingMode` to `basic`.\n\n\n\n\n\n## File uploads\n\nRequest parameters that correspond to file uploads can be passed as `bytes`, or a [`PathLike`](https://docs.python.org/3/library/os.html#os.PathLike) instance or a tuple of `(filename, contents, media type)`.\n\n```python\nfrom pathlib import Path\nfrom graphor import Graphor\n\nclient = Graphor()\n\nclient.sources.ingest_file(\n    file=Path("/path/to/file"),\n)\n```\n\nThe async client uses the exact same interface. If you pass a [`PathLike`](https://docs.python.org/3/library/os.html#os.PathLike) instance, the file contents will be read asynchronously automatically.\n\n## Handling errors\n\nWhen the library is unable to connect to the API (for example, due to network connection problems or a timeout), a subclass of `graphor.APIConnectionError` is raised.\n\nWhen the API returns a non-success status code (that is, 4xx or 5xx\nresponse), a subclass of `graphor.APIStatusError` is raised, containing `status_code` and `response` properties.\n\nAll errors inherit from `graphor.APIError`.\n\n```python\nimport graphor\nfrom graphor import Graphor\n\nclient = Graphor()\n\ntry:\n    client.sources.ingest_url(\n        url="https://example.com/blog/ai-trends-2025",\n    )\nexcept graphor.APIConnectionError as e:\n    print("The server could not be reached")\n    print(e.__cause__) # an underlying Exception, likely raised within httpx.\nexcept graphor.RateLimitError as e:\n    print("A 429 status code was received; we should back off a bit.")\nexcept graphor.APIStatusError as e:\n    print("Another non-200-range status code was received")\n    print(e.status_code)\n    print(e.response)\n```\n\nError codes are as follows:\n\n| Status Code | Error Type                 |\n| ----------- | -------------------------- |\n| 400         | `BadRequestError`          |\n| 401         | `AuthenticationError`      |\n| 403         | `PermissionDeniedError`    |\n| 404         | `NotFoundError`            |\n| 422         | `UnprocessableEntityError` |\n| 429         | `RateLimitError`           |\n| >=500       | `InternalServerError`      |\n| N/A         | `APIConnectionError`       |\n\n### Retries\n\nCertain errors are automatically retried 0 times by default, with a short exponential backoff.\nConnection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,\n429 Rate Limit, and >=500 Internal errors are all retried by default.\n\nYou can use the `max_retries` option to configure or disable retry settings:\n\n```python\nfrom graphor import Graphor\n\n# Configure the default for all requests:\nclient = Graphor(\n    # default is 2\n    max_retries=0,\n)\n\n# Or, configure per-request:\nclient.with_options(max_retries = 5).sources.ingest_url(\n    url="https://example.com/blog/ai-trends-2025",\n)\n```\n\n### Timeouts\n\nBy default requests time out after 10 minutes. You can configure this with a `timeout` option,\nwhich accepts a float or an [`httpx.Timeout`](https://www.python-httpx.org/advanced/timeouts/#fine-tuning-the-configuration) object:\n\n```python\nfrom graphor import Graphor\n\n# Configure the default for all requests:\nclient = Graphor(\n    # 20 seconds (default is 10 minutes)\n    timeout=20.0,\n)\n\n# More granular control:\nclient = Graphor(\n    timeout=httpx.Timeout(60.0, read=5.0, write=10.0, connect=2.0),\n)\n\n# Override per-request:\nclient.with_options(timeout = 5.0).sources.ingest_url(\n    url="https://example.com/blog/ai-trends-2025",\n)\n```\n\nOn timeout, an `APITimeoutError` is thrown.\n\nNote that requests that time out are [retried twice by default](#retries).\n\n\n\n## Advanced\n\n### Logging\n\nWe use the standard library [`logging`](https://docs.python.org/3/library/logging.html) module.\n\nYou can enable logging by setting the environment variable `GRAPHOR_LOG` to `info`.\n\n```shell\n$ export GRAPHOR_LOG=info\n```\n\nOr to `debug` for more verbose logging.\n\n### How to tell whether `None` means `null` or missing\n\nIn an API response, a field may be explicitly `null`, or missing entirely; in either case, its value is `None` in this library. You can differentiate the two cases with `.model_fields_set`:\n\n```py\nif response.my_field is None:\n  if \'my_field\' not in response.model_fields_set:\n    print(\'Got json like {}, without a "my_field" key present at all.\')\n  else:\n    print(\'Got json like {"my_field": null}.\')\n```\n\n### Accessing raw response data (e.g. headers)\n\nThe "raw" Response object can be accessed by prefixing `.with_raw_response.` to any HTTP method call, e.g.,\n\n```py\nfrom graphor import Graphor\n\nclient = Graphor()\nresponse = client.sources.with_raw_response.ingest_url(\n    url="https://example.com/blog/ai-trends-2025",\n)\nprint(response.headers.get(\'X-My-Header\'))\n\nsource = response.parse()  # get the object that `sources.ingest_url()` would have returned\nprint(source.build_id)\n```\n\nThese methods return an [`APIResponse`](https://github.com/synapseops/graphor-python-sdk/tree/main/src/graphor/_response.py) object.\n\nThe async client returns an [`AsyncAPIResponse`](https://github.com/synapseops/graphor-python-sdk/tree/main/src/graphor/_response.py) with the same structure, the only difference being `await`able methods for reading the response content.\n\n#### `.with_streaming_response`\n\nThe above interface eagerly reads the full response body when you make the request, which may not always be what you want.\n\nTo stream the response body, use `.with_streaming_response` instead, which requires a context manager and only reads the response body once you call `.read()`, `.text()`, `.json()`, `.iter_bytes()`, `.iter_text()`, `.iter_lines()` or `.parse()`. In the async client, these are async methods.\n\n```python\nwith client.sources.with_streaming_response.ingest_url(\n    url="https://example.com/blog/ai-trends-2025",\n) as response :\n    print(response.headers.get(\'X-My-Header\'))\n\n    for line in response.iter_lines():\n      print(line)\n```\n\nThe context manager is required so that the response will reliably be closed.\n\n### Making custom/undocumented requests\n\nThis library is typed for convenient access to the documented API.\n\nIf you need to access undocumented endpoints, params, or response properties, the library can still be used.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints, you can make requests using `client.get`, `client.post`, and other\nhttp verbs. Options on the client will be respected (such as retries) when making this request.\n\n```py\nimport httpx\n\nresponse = client.post(\n    "/foo",\n    cast_to=httpx.Response,\n    body={"my_param": True},\n)\n\nprint(response.headers.get("x-foo"))\n```\n\n#### Undocumented request params\n\nIf you want to explicitly send an extra param, you can do so with the `extra_query`, `extra_body`, and `extra_headers` request\noptions.\n\n#### Undocumented response properties\n\nTo access undocumented response properties, you can access the extra fields like `response.unknown_prop`. You\ncan also get all the extra fields on the Pydantic model as a dict with\n[`response.model_extra`](https://docs.pydantic.dev/latest/api/base_model/#pydantic.BaseModel.model_extra).\n\n### Configuring the HTTP client\n\nYou can directly override the [httpx client](https://www.python-httpx.org/api/#client) to customize it for your use case, including:\n\n- Support for [proxies](https://www.python-httpx.org/advanced/proxies/)\n- Custom [transports](https://www.python-httpx.org/advanced/transports/)\n- Additional [advanced](https://www.python-httpx.org/advanced/clients/) functionality\n\n```python\nimport httpx\nfrom graphor import Graphor, DefaultHttpxClient\n\nclient = Graphor(\n    # Or use the `GRAPHOR_BASE_URL` env var\n    base_url="http://my.test.server.example.com:8083",\n    http_client=DefaultHttpxClient(proxy="http://my.test.proxy.example.com", transport=httpx.HTTPTransport(local_address="0.0.0.0")),\n)\n```\n\nYou can also customize the client on a per-request basis by using `with_options()`:\n\n```python\nclient.with_options(http_client=DefaultHttpxClient(...))\n```\n\n### Managing HTTP resources\n\nBy default the library closes underlying HTTP connections whenever the client is [garbage collected](https://docs.python.org/3/reference/datamodel.html#object.__del__). You can manually close the client using the `.close()` method if desired, or with a context manager that closes when exiting.\n\n```py\nfrom graphor import Graphor\n\nwith Graphor() as client:\n  # make requests here\n  ...\n\n# HTTP client is now closed\n```\n\n## Versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes that only affect static types, without breaking runtime behavior.\n2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n3. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/synapseops/graphor-python-sdk/issues) with questions, bugs, or suggestions.\n\n### Determining the installed version\n\nIf you\'ve upgraded to the latest version but aren\'t seeing any new features you were expecting then your python environment is likely still using an older version.\n\nYou can determine the version that is being used at runtime with:\n\n```py\nimport graphor\nprint(graphor.__version__)\n```\n\n## Requirements\n\nPython 3.9 or higher.\n\n## Contributing\n\nSee [the contributing documentation](./CONTRIBUTING.md).\n',
  },
  {
    language: 'typescript',
    content:
      "# Graphor TypeScript API Library\n\n[![NPM version](https://img.shields.io/npm/v/graphor.svg?label=npm%20(stable))](https://npmjs.org/package/graphor) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/graphor)\n\nThis library provides convenient access to the Graphor REST API from server-side TypeScript or JavaScript.\n\n\n\nThe REST API documentation can be found on [docs.graphorlm.com](https://docs.graphorlm.com). The full API of this library can be found in [api.md](api.md).\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Graphor MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=graphor-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdyYXBob3ItbWNwIl0sImVudiI6eyJHUkFQSE9SX0FQSV9LRVkiOiJNeSBBUEkgS2V5In19)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22graphor-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22graphor-mcp%22%5D%2C%22env%22%3A%7B%22GRAPHOR_API_KEY%22%3A%22My%20API%20Key%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Installation\n\n```sh\nnpm install graphor\n```\n\n\n\n## Usage\n\nThe full API of this library can be found in [api.md](api.md).\n\n<!-- prettier-ignore -->\n```js\nimport Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.sources.ingestURL({ url: 'https://example.com/blog/ai-trends-2025' });\n\nconsole.log(response.build_id);\n```\n\n\n\n### Request & Response types\n\nThis library includes TypeScript definitions for all request params and response fields. You may import and use them like so:\n\n<!-- prettier-ignore -->\n```ts\nimport Graphor from 'graphor';\n\nconst client = new Graphor({\n  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted\n});\n\nconst params: Graphor.SourceIngestURLParams = { url: 'https://example.com/blog/ai-trends-2025' };\nconst response: Graphor.SourceIngestURLResponse = await client.sources.ingestURL(params);\n```\n\nDocumentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.\n\n## File uploads\n\nRequest parameters that correspond to file uploads can be passed in many different forms:\n- `File` (or an object with the same structure)\n- a `fetch` `Response` (or an object with the same structure)\n- an `fs.ReadStream`\n- the return value of our `toFile` helper\n\n```ts\nimport fs from 'fs';\nimport Graphor, { toFile } from 'graphor';\n\nconst client = new Graphor();\n\n// If you have access to Node `fs` we recommend using `fs.createReadStream()`:\nawait client.sources.ingestFile({ file: fs.createReadStream('/path/to/file') });\n\n// Or if you have the web `File` API you can pass a `File` instance:\nawait client.sources.ingestFile({ file: new File(['my bytes'], 'file') });\n\n// You can also pass a `fetch` `Response`:\nawait client.sources.ingestFile({ file: await fetch('https://somesite/file') });\n\n// Finally, if none of the above are convenient, you can use our `toFile` helper:\nawait client.sources.ingestFile({ file: await toFile(Buffer.from('my bytes'), 'file') });\nawait client.sources.ingestFile({ file: await toFile(new Uint8Array([0, 1, 2]), 'file') });\n```\n\n\n\n## Handling errors\n\nWhen the library is unable to connect to the API,\nor if the API returns a non-success status code (i.e., 4xx or 5xx response),\na subclass of `APIError` will be thrown:\n\n<!-- prettier-ignore -->\n```ts\nconst response = await client.sources\n  .ingestURL({ url: 'https://example.com/blog/ai-trends-2025' })\n  .catch(async (err) => {\n    if (err instanceof Graphor.APIError) {\n      console.log(err.status); // 400\n      console.log(err.name); // BadRequestError\n      console.log(err.headers); // {server: 'nginx', ...}\n    } else {\n      throw err;\n    }\n  });\n```\n\nError codes are as follows:\n\n| Status Code | Error Type                 |\n| ----------- | -------------------------- |\n| 400         | `BadRequestError`          |\n| 401         | `AuthenticationError`      |\n| 403         | `PermissionDeniedError`    |\n| 404         | `NotFoundError`            |\n| 422         | `UnprocessableEntityError` |\n| 429         | `RateLimitError`           |\n| >=500       | `InternalServerError`      |\n| N/A         | `APIConnectionError`       |\n\n### Retries\n\nCertain errors will be automatically retried 0 times by default, with a short exponential backoff.\nConnection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,\n429 Rate Limit, and >=500 Internal errors will all be retried by default.\n\nYou can use the `maxRetries` option to configure or disable this:\n\n<!-- prettier-ignore -->\n```js\n// Configure the default for all requests:\nconst client = new Graphor({\n  maxRetries: 0, // default is 2\n});\n\n// Or, configure per-request:\nawait client.sources.ingestURL({ url: 'https://example.com/blog/ai-trends-2025' }, {\n  maxRetries: 5,\n});\n```\n\n### Timeouts\n\nRequests time out after 10 minutes by default. You can configure this with a `timeout` option:\n\n<!-- prettier-ignore -->\n```ts\n// Configure the default for all requests:\nconst client = new Graphor({\n  timeout: 20 * 1000, // 20 seconds (default is 10 minutes)\n});\n\n// Override per-request:\nawait client.sources.ingestURL({ url: 'https://example.com/blog/ai-trends-2025' }, {\n  timeout: 5 * 1000,\n});\n```\n\nOn timeout, an `APIConnectionTimeoutError` is thrown.\n\nNote that requests which time out will be [retried twice by default](#retries).\n\n\n\n\n\n## Advanced Usage\n\n### Accessing raw Response data (e.g., headers)\n\nThe \"raw\" `Response` returned by `fetch()` can be accessed through the `.asResponse()` method on the `APIPromise` type that all methods return.\nThis method returns as soon as the headers for a successful response are received and does not consume the response body, so you are free to write custom parsing or streaming logic.\n\nYou can also use the `.withResponse()` method to get the raw `Response` along with the parsed data.\nUnlike `.asResponse()` this method consumes the body, returning once it is parsed.\n\n<!-- prettier-ignore -->\n```ts\nconst client = new Graphor();\n\nconst response = await client.sources\n  .ingestURL({ url: 'https://example.com/blog/ai-trends-2025' })\n  .asResponse();\nconsole.log(response.headers.get('X-My-Header'));\nconsole.log(response.statusText); // access the underlying Response object\n\nconst { data: response, response: raw } = await client.sources\n  .ingestURL({ url: 'https://example.com/blog/ai-trends-2025' })\n  .withResponse();\nconsole.log(raw.headers.get('X-My-Header'));\nconsole.log(response.build_id);\n```\n\n### Logging\n\n> [!IMPORTANT]\n> All log messages are intended for debugging only. The format and content of log messages\n> may change between releases.\n\n#### Log levels\n\nThe log level can be configured in two ways:\n\n1. Via the `GRAPHOR_LOG` environment variable\n2. Using the `logLevel` client option (overrides the environment variable if set)\n\n```ts\nimport Graphor from 'graphor';\n\nconst client = new Graphor({\n  logLevel: 'debug', // Show all log messages\n});\n```\n\nAvailable log levels, from most to least verbose:\n\n- `'debug'` - Show debug messages, info, warnings, and errors\n- `'info'` - Show info messages, warnings, and errors\n- `'warn'` - Show warnings and errors (default)\n- `'error'` - Show only errors\n- `'off'` - Disable all logging\n\nAt the `'debug'` level, all HTTP requests and responses are logged, including headers and bodies.\nSome authentication-related headers are redacted, but sensitive data in request and response bodies\nmay still be visible.\n\n#### Custom logger\n\nBy default, this library logs to `globalThis.console`. You can also provide a custom logger.\nMost logging libraries are supported, including [pino](https://www.npmjs.com/package/pino), [winston](https://www.npmjs.com/package/winston), [bunyan](https://www.npmjs.com/package/bunyan), [consola](https://www.npmjs.com/package/consola), [signale](https://www.npmjs.com/package/signale), and [@std/log](https://jsr.io/@std/log). If your logger doesn't work, please open an issue.\n\nWhen providing a custom logger, the `logLevel` option still controls which messages are emitted, messages\nbelow the configured level will not be sent to your logger.\n\n```ts\nimport Graphor from 'graphor';\nimport pino from 'pino';\n\nconst logger = pino();\n\nconst client = new Graphor({\n  logger: logger.child({ name: 'Graphor' }),\n  logLevel: 'debug', // Send all messages to pino, allowing it to filter\n});\n```\n\n### Making custom/undocumented requests\n\nThis library is typed for convenient access to the documented API. If you need to access undocumented\nendpoints, params, or response properties, the library can still be used.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints, you can use `client.get`, `client.post`, and other HTTP verbs.\nOptions on the client, such as retries, will be respected when making these requests.\n\n```ts\nawait client.post('/some/path', {\n  body: { some_prop: 'foo' },\n  query: { some_query_arg: 'bar' },\n});\n```\n\n#### Undocumented request params\n\nTo make requests using undocumented parameters, you may use `// @ts-expect-error` on the undocumented\nparameter. This library doesn't validate at runtime that the request matches the type, so any extra values you\nsend will be sent as-is.\n\n```ts\nclient.sources.ingestURL({\n  // ...\n  // @ts-expect-error baz is not yet public\n  baz: 'undocumented option',\n});\n```\n\nFor requests with the `GET` verb, any extra params will be in the query, all other requests will send the\nextra param in the body.\n\nIf you want to explicitly send an extra argument, you can do so with the `query`, `body`, and `headers` request\noptions.\n\n#### Undocumented response properties\n\nTo access undocumented response properties, you may access the response object with `// @ts-expect-error` on\nthe response object, or cast the response object to the requisite type. Like the request params, we do not\nvalidate or strip extra properties from the response from the API.\n\n### Customizing the fetch client\n\nBy default, this library expects a global `fetch` function is defined.\n\nIf you want to use a different `fetch` function, you can either polyfill the global:\n\n```ts\nimport fetch from 'my-fetch';\n\nglobalThis.fetch = fetch;\n```\n\nOr pass it to the client:\n\n```ts\nimport Graphor from 'graphor';\nimport fetch from 'my-fetch';\n\nconst client = new Graphor({ fetch });\n```\n\n### Fetch options\n\nIf you want to set custom `fetch` options without overriding the `fetch` function, you can provide a `fetchOptions` object when instantiating the client or making a request. (Request-specific options override client options.)\n\n```ts\nimport Graphor from 'graphor';\n\nconst client = new Graphor({\n  fetchOptions: {\n    // `RequestInit` options\n  },\n});\n```\n\n#### Configuring proxies\n\nTo modify proxy behavior, you can provide custom `fetchOptions` that add runtime-specific proxy\noptions to requests:\n\n<img src=\"https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/node.svg\" align=\"top\" width=\"18\" height=\"21\"> **Node** <sup>[[docs](https://github.com/nodejs/undici/blob/main/docs/docs/api/ProxyAgent.md#example---proxyagent-with-fetch)]</sup>\n\n```ts\nimport Graphor from 'graphor';\nimport * as undici from 'undici';\n\nconst proxyAgent = new undici.ProxyAgent('http://localhost:8888');\nconst client = new Graphor({\n  fetchOptions: {\n    dispatcher: proxyAgent,\n  },\n});\n```\n\n<img src=\"https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/bun.svg\" align=\"top\" width=\"18\" height=\"21\"> **Bun** <sup>[[docs](https://bun.sh/guides/http/proxy)]</sup>\n\n```ts\nimport Graphor from 'graphor';\n\nconst client = new Graphor({\n  fetchOptions: {\n    proxy: 'http://localhost:8888',\n  },\n});\n```\n\n<img src=\"https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/deno.svg\" align=\"top\" width=\"18\" height=\"21\"> **Deno** <sup>[[docs](https://docs.deno.com/api/deno/~/Deno.createHttpClient)]</sup>\n\n```ts\nimport Graphor from 'npm:graphor';\n\nconst httpClient = Deno.createHttpClient({ proxy: { url: 'http://localhost:8888' } });\nconst client = new Graphor({\n  fetchOptions: {\n    client: httpClient,\n  },\n});\n```\n\n## Frequently Asked Questions\n\n## Semantic versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes that only affect static types, without breaking runtime behavior.\n2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n3. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/synapseops/graphor-typescript-sdk/issues) with questions, bugs, or suggestions.\n\n## Requirements\n\nTypeScript >= 4.9 is supported.\n\nThe following runtimes are supported:\n\n- Web browsers (Up-to-date Chrome, Firefox, Safari, Edge, and more)\n- Node.js 20 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.\n- Deno v1.28.0 or higher.\n- Bun 1.0 or later.\n- Cloudflare Workers.\n- Vercel Edge Runtime.\n- Jest 28 or greater with the `\"node\"` environment (`\"jsdom\"` is not supported at this time).\n- Nitro v2.6 or greater.\n\nNote that React Native is not supported at this time.\n\nIf you are interested in other runtime environments, please open or upvote an issue on GitHub.\n\n## Contributing\n\nSee [the contributing documentation](./CONTRIBUTING.md).\n",
  },
];

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
