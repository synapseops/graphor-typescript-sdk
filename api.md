# Sources

Types:

- <code><a href="./src/resources/sources.ts">PublicSource</a></code>
- <code><a href="./src/resources/sources.ts">SourceListResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceDeleteResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceAskResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceExtractResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceRetrieveChunksResponse</a></code>

Methods:

- <code title="get /sources">client.sources.<a href="./src/resources/sources.ts">list</a>({ ...params }) -> SourceListResponse</code>
- <code title="delete /sources/delete">client.sources.<a href="./src/resources/sources.ts">delete</a>({ ...params }) -> SourceDeleteResponse</code>
- <code title="post /sources/ask-sources">client.sources.<a href="./src/resources/sources.ts">ask</a>({ ...params }) -> SourceAskResponse</code>
- <code title="post /sources/run-extraction">client.sources.<a href="./src/resources/sources.ts">extract</a>({ ...params }) -> SourceExtractResponse</code>
- <code title="post /sources/prebuilt-rag">client.sources.<a href="./src/resources/sources.ts">retrieveChunks</a>({ ...params }) -> SourceRetrieveChunksResponse</code>
