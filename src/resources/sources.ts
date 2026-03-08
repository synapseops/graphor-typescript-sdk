// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Sources extends APIResource {
  /**
   * List all sources in the project's knowledge graph.
   *
   * Returns every source node currently stored in the knowledge graph for the
   * authenticated project. Each item includes the file metadata (ID, name, size,
   * type, origin) along with its current processing status and a human-readable
   * status message.
   *
   * **Query parameters:**
   *
   * - **file_ids** (list, optional): If provided, only sources whose file_id is in
   *   this list are returned. Repeat the param for multiple IDs (e.g.
   *   ?file_ids=id1&file_ids=id2).
   *
   * **Status messages returned per source:**
   *
   * - `"completed"` → _"Source processed successfully"_
   * - `"processing"` → _"Source is being processed"_
   * - `"failed"` → _"Source processing failed"_
   *
   * **Returns** a JSON array of `PublicSourceResponse` objects.
   *
   * **Error responses:**
   *
   * - `500` — Unexpected internal error while retrieving sources.
   *
   * @example
   * ```ts
   * const publicSources = await client.sources.list();
   * ```
   */
  list(
    query: SourceListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<SourceListResponse> {
    return this._client.get('/sources', { query, ...options });
  }

  /**
   * Delete a source from the project's knowledge graph and all associated data.
   *
   * Removes the source node, its partitions/chunks, embeddings, and any stored files
   * from the knowledge graph and object storage. The operation is irreversible.
   *
   * **Parameters (JSON body):**
   *
   * - **file_id** (str, optional — preferred): The unique identifier of the source
   *   to delete.
   * - **file_name** (str, optional — deprecated): The display name of the source.
   *   Use `file_id` instead when possible. At least one of `file_id` or `file_name`
   *   must be provided.
   *
   * **Returns** a `PublicDeleteSourceResponse` with the deletion status, file ID,
   * file name, project ID, and project name.
   *
   * **Error responses:**
   *
   * - `400` — Invalid input (e.g. neither identifier provided).
   * - `403` — Permission denied.
   * - `404` — Source not found.
   * - `500` — Unexpected internal error.
   *
   * @example
   * ```ts
   * const source = await client.sources.delete();
   * ```
   */
  delete(body: SourceDeleteParams, options?: RequestOptions): APIPromise<SourceDeleteResponse> {
    return this._client.delete('/sources/delete', { body, ...options });
  }

  /**
   * Ask a natural-language question grounded on the project's ingested sources.
   *
   * This is the primary Q&A endpoint. It sends the question through the GenAI File
   * Search pipeline, which retrieves relevant chunks from the knowledge graph,
   * grounds the answer in the source documents, and returns a natural-language
   * response. Optionally, you can request a structured JSON output by supplying an
   * `output_schema`.
   *
   * Conversation memory is supported: pass a `conversation_id` to continue an
   * existing conversation, or set `reset` to `true` to start fresh.
   *
   * **Parameters (JSON body):**
   *
   * - **question** (str, required): The question to ask about the sources.
   * - **conversation_id** (str, optional): An existing conversation identifier to
   *   maintain context across multiple turns.
   * - **reset** (bool, optional, default `false`): When `true`, starts a new
   *   conversation discarding any previous history.
   * - **file_ids** (list[str], optional — preferred): Restrict the search scope to
   *   specific source file IDs.
   * - **file_names** (list[str], optional — deprecated): Restrict the search scope
   *   to specific source file names. Use `file_ids` when possible.
   * - **output_schema** (dict, optional): A JSON Schema for requesting structured
   *   output. When provided, the response includes a `structured_output` field
   *   validated against this schema and the `raw_json` produced by the model.
   * - **thinking_level** (str, optional, default `"accurate"`): Controls the
   *   model/thinking budget — one of `"fast"`, `"balanced"`, or `"accurate"`.
   *
   * **Returns** a `PublicAskSourcesResponse` containing:
   *
   * - `answer` — the natural-language answer (or a status message when
   *   `output_schema` is provided).
   * - `structured_output` — the validated structured object (when `output_schema` is
   *   provided).
   * - `raw_json` — the raw JSON text before validation (when `output_schema` is
   *   provided).
   * - `conversation_id` — the conversation identifier for follow-up questions.
   *
   * **Error responses:**
   *
   * - `500` — Unexpected internal error while asking sources.
   *
   * @example
   * ```ts
   * const response = await client.sources.ask({
   *   question: 'question',
   * });
   * ```
   */
  ask(body: SourceAskParams, options?: RequestOptions): APIPromise<SourceAskResponse> {
    return this._client.post('/sources/ask-sources', { body, ...options });
  }

  /**
   * Run a one-off structured data extraction against one or more sources.
   *
   * This endpoint uses the GenAI File Search pipeline to read the specified sources,
   * apply the user-provided instruction, and return structured JSON output
   * conforming to the supplied `output_schema`. Internally it builds a grounded
   * prompt, queries the model, and validates/corrects the raw JSON against the
   * schema.
   *
   * **Parameters (JSON body):**
   *
   * - **file_ids** (list[str], optional — preferred): List of source file IDs to
   *   extract from.
   * - **file_names** (list[str], optional — deprecated): List of source file names
   *   to extract from. Use `file_ids` when possible. At least one of the two lists
   *   must be provided and non-empty.
   * - **user_instruction** (str, required): A natural-language instruction that
   *   guides what information to extract from the documents.
   * - **output_schema** (dict, required): A JSON Schema object describing the
   *   desired structured output shape. The model will produce data conforming to
   *   this schema.
   * - **thinking_level** (str, optional, default `"accurate"`): Controls the
   *   model/thinking budget — one of `"fast"`, `"balanced"`, or `"accurate"`.
   *
   * **Returns** a `PublicRunExtractionResultResponse` containing:
   *
   * - `structured_output` — the validated structured object.
   * - `raw_json` — the raw JSON text produced by the model before validation.
   *
   * **Error responses:**
   *
   * - `500` — Unexpected internal error during extraction.
   *
   * @example
   * ```ts
   * const response = await client.sources.extract({
   *   output_schema: { foo: 'bar' },
   *   user_instruction: 'user_instruction',
   * });
   * ```
   */
  extract(body: SourceExtractParams, options?: RequestOptions): APIPromise<SourceExtractResponse> {
    return this._client.post('/sources/run-extraction', { body, ...options });
  }

  /**
   * Retrieve relevant document chunks from the prebuilt RAG vector store.
   *
   * Performs a semantic similarity search over the project's prebuilt RAG store
   * using Google File Search with grounding. Returns the most relevant text chunks
   * along with their source metadata (file name, page number, relevance score). This
   * is a pure retrieval endpoint — it does **not** generate an answer; use
   * `/ask-sources` for Q&A.
   *
   * **Parameters (JSON body):**
   *
   * - **query** (str, required): The natural-language search query used to find
   *   relevant chunks.
   * - **file_ids** (list[str], optional — preferred): Restrict retrieval to specific
   *   source file IDs.
   * - **file_names** (list[str], optional — deprecated): Restrict retrieval to
   *   specific source file names. Use `file_ids` when possible.
   *
   * **Returns** a `PublicRetrieveResponse` containing:
   *
   * - `query` — the original search query.
   * - `chunks` — a list of `PublicRetrieveChunk` objects, each with `text`,
   *   `file_name`, `page_number`, `score`, and additional `metadata`.
   * - `total` — the total number of chunks returned.
   *
   * **Error responses:**
   *
   * - `500` — Unexpected internal error during retrieval.
   *
   * @example
   * ```ts
   * const response = await client.sources.retrieveChunks({
   *   query: 'query',
   * });
   * ```
   */
  retrieveChunks(
    body: SourceRetrieveChunksParams,
    options?: RequestOptions,
  ): APIPromise<SourceRetrieveChunksResponse> {
    return this._client.post('/sources/prebuilt-rag', { body, ...options });
  }
}

export interface PublicSource {
  /**
   * Display name of the source file
   */
  file_name: string;

  /**
   * File size in bytes
   */
  file_size: number;

  /**
   * Origin of the file (e.g. local_file, url, github, youtube)
   */
  file_source: string;

  /**
   * File extension / type (e.g. pdf, docx, txt)
   */
  file_type: string;

  /**
   * Human-readable status message
   */
  message: string;

  /**
   * UUID of the project this source belongs to
   */
  project_id: string;

  /**
   * Display name of the project
   */
  project_name: string;

  /**
   * Current processing status of the source (e.g. completed, processing, failed,
   * new)
   */
  status: string;

  /**
   * Unique identifier for the source
   */
  file_id?: string | null;

  /**
   * Partitioning strategy used during ingestion. V1 API: basic, hi_res, hi_res_ft,
   * mai, graphorlm. V2 API: fast, balanced, accurate, vlm, agentic.
   */
  partition_method?: string | null;
}

export type SourceListResponse = Array<PublicSource>;

export interface SourceDeleteResponse {
  /**
   * Display name of the deleted file
   */
  file_name: string;

  /**
   * Human-readable result message
   */
  message: string;

  /**
   * UUID of the project
   */
  project_id: string;

  /**
   * Display name of the project
   */
  project_name: string;

  /**
   * Result status of the deletion (e.g. 'success')
   */
  status: string;

  /**
   * Unique identifier of the deleted source
   */
  file_id?: string | null;
}

export interface SourceAskResponse {
  /**
   * The answer to the question. When output_schema is provided, this will be a short
   * status message and the structured data will be in structured_output (and the raw
   * JSON-text in raw_json).
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
   * List of retrieved chunks ordered by relevance
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
     * Additional metadata for the chunk (e.g. element type, coordinates)
     */
    metadata?: { [key: string]: unknown } | null;

    /**
     * The page number where this chunk appears in the original document
     */
    page_number?: number | null;

    /**
     * Relevance score between 0 and 1 (higher is more relevant)
     */
    score?: number | null;
  }
}

export interface SourceListParams {
  /**
   * Optional list of file_id to filter by (only these sources are returned). Repeat
   * the param for multiple IDs.
   */
  file_ids?: Array<string> | null;
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
   * The natural-language question to ask about the sources
   */
  question: string;

  /**
   * Conversation identifier to maintain memory context across multiple turns
   */
  conversation_id?: string | null;

  /**
   * Optional list of file IDs to restrict search scope (preferred)
   */
  file_ids?: Array<string> | null;

  /**
   * Optional list of file display names to restrict search scope (deprecated, use
   * file_ids)
   */
  file_names?: Array<string> | null;

  /**
   * Optional JSON Schema for requesting structured output. When provided, the answer
   * field will contain a short status message and the structured data will be in
   * structured_output.
   */
  output_schema?: { [key: string]: unknown } | null;

  /**
   * When true, starts a new conversation discarding any previous history
   */
  reset?: boolean | null;

  /**
   * Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', or
   * 'accurate' (most thorough)
   */
  thinking_level?: 'fast' | 'balanced' | 'accurate' | null;
}

export interface SourceExtractParams {
  /**
   * JSON Schema describing the desired structured output shape. The model will
   * produce data conforming to this schema.
   */
  output_schema: { [key: string]: unknown };

  /**
   * Natural-language instruction guiding what information to extract
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
   * Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', or
   * 'accurate' (most thorough)
   */
  thinking_level?: 'fast' | 'balanced' | 'accurate' | null;
}

export interface SourceRetrieveChunksParams {
  /**
   * The natural-language search query to find relevant chunks
   */
  query: string;

  /**
   * Optional list of file IDs to restrict retrieval scope (preferred)
   */
  file_ids?: Array<string> | null;

  /**
   * Optional list of file names to restrict retrieval scope (deprecated, use
   * file_ids)
   */
  file_names?: Array<string> | null;
}

export declare namespace Sources {
  export {
    type PublicSource as PublicSource,
    type SourceListResponse as SourceListResponse,
    type SourceDeleteResponse as SourceDeleteResponse,
    type SourceAskResponse as SourceAskResponse,
    type SourceExtractResponse as SourceExtractResponse,
    type SourceRetrieveChunksResponse as SourceRetrieveChunksResponse,
    type SourceListParams as SourceListParams,
    type SourceDeleteParams as SourceDeleteParams,
    type SourceAskParams as SourceAskParams,
    type SourceExtractParams as SourceExtractParams,
    type SourceRetrieveChunksParams as SourceRetrieveChunksParams,
  };
}
