// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';

export class Sources extends APIResource {
  /**
   * Get the source nodes of the knowledge graph for public access.
   */
  list(options?: RequestOptions): APIPromise<SourceListResponse> {
    return this._client.get('/sources', options);
  }

  /**
   * Delete a source from the project for public access.
   *
   * Accepts either file_id (preferred) or file_name (deprecated) as identifier.
   */
  delete(body: SourceDeleteParams, options?: RequestOptions): APIPromise<SourceDeleteResponse> {
    return this._client.delete('/sources/delete', { body, ...options });
  }

  /**
   * Public endpoint to ask questions about the sources.
   */
  ask(body: SourceAskParams, options?: RequestOptions): APIPromise<SourceAskResponse> {
    return this._client.post('/sources/ask-sources', { body, ...options });
  }

  /**
   * Run a one-off public extraction for files using the provided output schema.
   */
  extract(body: SourceExtractParams, options?: RequestOptions): APIPromise<SourceExtractResponse> {
    return this._client.post('/sources/run-extraction', { body, ...options });
  }

  /**
   * Loads elements from a file with optional pagination for public access.
   *
   * Accepts either file_id (preferred) or file_name (deprecated) as identifier.
   */
  loadElements(
    body: SourceLoadElementsParams,
    options?: RequestOptions,
  ): APIPromise<SourceLoadElementsResponse> {
    return this._client.post('/sources/elements', { body, ...options });
  }

  /**
   * Process/parse an existing source.
   *
   * Accepts either file_id (preferred) or file_name (deprecated) as identifier.
   */
  parse(body: SourceParseParams, options?: RequestOptions): APIPromise<PublicSource> {
    return this._client.post('/sources/process', { body, ...options });
  }

  /**
   * Public endpoint to retrieve relevant chunks from the prebuild RAG store. Uses
   * Google File Search with grounding to find relevant document chunks.
   *
   * Accepts either file_ids (preferred) or file_names (deprecated) as identifier.
   */
  retrieveChunks(
    body: SourceRetrieveChunksParams,
    options?: RequestOptions,
  ): APIPromise<SourceRetrieveChunksResponse> {
    return this._client.post('/sources/prebuilt-rag', { body, ...options });
  }

  /**
   * Upload
   */
  upload(body: SourceUploadParams, options?: RequestOptions): APIPromise<PublicSource> {
    return this._client.post(
      '/sources/upload',
      multipartFormRequestOptions({ body, ...options }, this._client),
    );
  }

  /**
   * Public endpoint to process a source from a GitHub repository using synchronous
   * ingestion.
   */
  uploadGitHub(body: SourceUploadGitHubParams, options?: RequestOptions): APIPromise<PublicSource> {
    return this._client.post('/sources/upload-github-source', { body, ...options });
  }

  /**
   * Public endpoint to upload and process a source from a URL. Triggers background
   * ingestion and returns immediately.
   */
  uploadURL(body: SourceUploadURLParams, options?: RequestOptions): APIPromise<PublicSource> {
    return this._client.post('/sources/upload-url-source', { body, ...options });
  }

  /**
   * Public endpoint to process a source from a YouTube video using synchronous
   * ingestion.
   */
  uploadYoutube(body: SourceUploadYoutubeParams, options?: RequestOptions): APIPromise<PublicSource> {
    return this._client.post('/sources/upload-youtube-source', { body, ...options });
  }
}

export type PartitionMethod =
  | 'basic'
  | 'hi_res'
  | 'hi_res_ft'
  | 'mai'
  | 'graphorlm'
  | 'ocr'
  | 'advanced'
  | 'yolox';

export interface PublicSource {
  file_name: string;

  file_size: number;

  file_source: string;

  file_type: string;

  message: string;

  project_id: string;

  project_name: string;

  status: string;

  /**
   * Unique identifier for the source
   */
  file_id?: string | null;

  partition_method?: PartitionMethod | null;
}

export type SourceListResponse = Array<PublicSource>;

export interface SourceDeleteResponse {
  /**
   * The name of the deleted file
   */
  file_name: string;

  /**
   * The message of the deletion
   */
  message: string;

  /**
   * The ID of the project
   */
  project_id: string;

  /**
   * The name of the project
   */
  project_name: string;

  /**
   * The status of the deletion
   */
  status: string;

  /**
   * Unique identifier for the source
   */
  file_id?: string | null;
}

export interface SourceAskResponse {
  /**
   * The answer to the question. When output_schema is provided, this will be a short
   * status message and the structured data will be in structured_output (and the raw
   * JSON-text from Passo A in raw_json).
   */
  answer: string;

  /**
   * Conversation identifier used to maintain memory context
   */
  conversation_id?: string | null;

  /**
   * Optional raw JSON-text produced by the sources model before
   * validation/correction.
   */
  raw_json?: string | null;

  /**
   * Optional structured output (object) validated against the requested
   * output_schema.
   */
  structured_output?: { [key: string]: unknown } | null;
}

export interface SourceExtractResponse {
  /**
   * List of file names used for extraction
   */
  file_names: Array<string>;

  /**
   * List of file IDs used for extraction
   */
  file_ids?: Array<string> | null;

  /**
   * Raw JSON-text produced by the model before validation/correction.
   */
  raw_json?: string | null;

  /**
   * Structured output (object) matching the requested output_schema.
   */
  structured_output?: { [key: string]: unknown } | null;
}

export interface SourceLoadElementsResponse {
  /**
   * List of items in the current page
   */
  items: Array<SourceLoadElementsResponse.Item>;

  /**
   * Total number of items
   */
  total: number;

  /**
   * Current page
   */
  page?: number | null;

  /**
   * Items per page
   */
  page_size?: number | null;

  /**
   * Total number of pages
   */
  total_pages?: number | null;
}

export namespace SourceLoadElementsResponse {
  /**
   * Class for storing a piece of text and associated metadata.
   *
   * Example:
   *
   *     .. code-block:: python
   *
   *         from langchain_core.documents import Document
   *
   *         document = Document(
   *             page_content="Hello, world!",
   *             metadata={"source": "https://example.com"}
   *         )
   */
  export interface Item {
    page_content: string;

    id?: string | null;

    metadata?: { [key: string]: unknown };

    type?: 'Document';
  }
}

export interface SourceRetrieveChunksResponse {
  /**
   * The original search query
   */
  query: string;

  /**
   * Total number of chunks retrieved
   */
  total: number;

  /**
   * List of retrieved chunks
   */
  chunks?: Array<SourceRetrieveChunksResponse.Chunk>;
}

export namespace SourceRetrieveChunksResponse {
  export interface Chunk {
    /**
     * The text content of the chunk
     */
    text: string;

    /**
     * The unique identifier of the source file
     */
    file_id?: string | null;

    /**
     * The source file name
     */
    file_name?: string | null;

    /**
     * Additional metadata for the chunk
     */
    metadata?: { [key: string]: unknown } | null;

    /**
     * The page number of the chunk
     */
    page_number?: number | null;

    /**
     * The relevance score of the chunk
     */
    score?: number | null;
  }
}

export interface SourceDeleteParams {
  /**
   * Unique identifier for the source (preferred)
   */
  file_id?: string | null;

  /**
   * The name of the file to delete (deprecated, use file_id)
   */
  file_name?: string | null;
}

export interface SourceAskParams {
  /**
   * The question to ask about the sources
   */
  question: string;

  /**
   * Conversation identifier to maintain memory context
   */
  conversation_id?: string | null;

  /**
   * Optional list of file IDs to restrict search to one or more documents
   * (preferred)
   */
  file_ids?: Array<string> | null;

  /**
   * Optional list of file display names to restrict search to one or more documents
   * (deprecated, use file_ids)
   */
  file_names?: Array<string> | null;

  /**
   * Optional JSON Schema used to request a structured output. When provided, the
   * system will first ask the sources model to output JSON-text, then
   * validate/correct it with gemini-3-flash-preview.
   */
  output_schema?: { [key: string]: unknown } | null;

  /**
   * When true, starts a new conversation and ignores history
   */
  reset?: boolean | null;

  /**
   * Controls model and thinking configuration: 'fast', 'balanced', 'accurate'
   */
  thinking_level?: 'fast' | 'balanced' | 'accurate' | null;
}

export interface SourceExtractParams {
  /**
   * JSON Schema used to request a structured output. The system will extract data
   * according to this schema.
   */
  output_schema: { [key: string]: unknown };

  /**
   * User instruction to guide the extraction
   */
  user_instruction: string;

  /**
   * List of file IDs to extract from (preferred)
   */
  file_ids?: Array<string> | null;

  /**
   * List of file names to extract from (deprecated, use file_ids)
   */
  file_names?: Array<string> | null;

  /**
   * Controls model and thinking configuration: 'fast', 'balanced', 'accurate'
   */
  thinking_level?: 'fast' | 'balanced' | 'accurate' | null;
}

export interface SourceLoadElementsParams {
  /**
   * Unique identifier for the source (preferred)
   */
  file_id?: string | null;

  /**
   * The name of the file (deprecated, use file_id)
   */
  file_name?: string | null;

  /**
   * The filter of the elements
   */
  filter?: SourceLoadElementsParams.Filter | null;

  /**
   * Current page number
   */
  page?: number | null;

  /**
   * Number of items per page
   */
  page_size?: number | null;
}

export namespace SourceLoadElementsParams {
  /**
   * The filter of the elements
   */
  export interface Filter {
    /**
     * The elements to remove
     */
    elementsToRemove?: Array<string> | null;

    /**
     * The page numbers of the elements
     */
    page_numbers?: Array<number> | null;

    /**
     * The type of the element
     */
    type?: string | null;
  }
}

export interface SourceParseParams {
  /**
   * Unique identifier for the source (preferred)
   */
  file_id?: string | null;

  /**
   * The name of the file (deprecated, use file_id)
   */
  file_name?: string | null;

  /**
   * The method used to partition the file
   */
  partition_method?: PartitionMethod;
}

export interface SourceRetrieveChunksParams {
  /**
   * The search query to retrieve relevant chunks
   */
  query: string;

  /**
   * Optional list of file IDs to restrict retrieval to one or more documents
   * (preferred)
   */
  file_ids?: Array<string> | null;

  /**
   * Optional list of file names to restrict retrieval to one or more documents
   * (deprecated, use file_ids)
   */
  file_names?: Array<string> | null;
}

export interface SourceUploadParams {
  file: Uploadable;
}

export interface SourceUploadGitHubParams {
  /**
   * The url of the github repository
   */
  url: string;
}

export interface SourceUploadURLParams {
  /**
   * The url of the source
   */
  url: string;

  /**
   * Whether to crawl urls from the source
   */
  crawlUrls?: boolean;
}

export interface SourceUploadYoutubeParams {
  /**
   * The url of the youtube video
   */
  url: string;
}

export declare namespace Sources {
  export {
    type PartitionMethod as PartitionMethod,
    type PublicSource as PublicSource,
    type SourceListResponse as SourceListResponse,
    type SourceDeleteResponse as SourceDeleteResponse,
    type SourceAskResponse as SourceAskResponse,
    type SourceExtractResponse as SourceExtractResponse,
    type SourceLoadElementsResponse as SourceLoadElementsResponse,
    type SourceRetrieveChunksResponse as SourceRetrieveChunksResponse,
    type SourceDeleteParams as SourceDeleteParams,
    type SourceAskParams as SourceAskParams,
    type SourceExtractParams as SourceExtractParams,
    type SourceLoadElementsParams as SourceLoadElementsParams,
    type SourceParseParams as SourceParseParams,
    type SourceRetrieveChunksParams as SourceRetrieveChunksParams,
    type SourceUploadParams as SourceUploadParams,
    type SourceUploadGitHubParams as SourceUploadGitHubParams,
    type SourceUploadURLParams as SourceUploadURLParams,
    type SourceUploadYoutubeParams as SourceUploadYoutubeParams,
  };
}
