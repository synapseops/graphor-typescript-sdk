# Sources

Types:

- <code><a href="./src/resources/sources.ts">Element</a></code>
- <code><a href="./src/resources/sources.ts">Folder</a></code>
- <code><a href="./src/resources/sources.ts">Method</a></code>
- <code><a href="./src/resources/sources.ts">PublicSource</a></code>
- <code><a href="./src/resources/sources.ts">SourceListResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceDeleteResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceAskResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceExtractResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceGetBuildStatusResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceGetElementsResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceGetPageScreenshotResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceIndexBuildResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceIngestFileResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceIngestGitHubResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceIngestURLResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceIngestYoutubeResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceReprocessResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceRetrieveChunksResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceListFoldersResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceCreateFolderResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceRenameFolderResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceRemoveFolderResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceDeleteFolderResponse</a></code>
- <code><a href="./src/resources/sources.ts">SourceMoveResponse</a></code>

Methods:

- <code title="get /sources">client.sources.<a href="./src/resources/sources.ts">list</a>({ ...params }) -> SourceListResponse</code>
- <code title="delete /sources/delete">client.sources.<a href="./src/resources/sources.ts">delete</a>({ ...params }) -> SourceDeleteResponse</code>
- <code title="post /sources/ask-sources">client.sources.<a href="./src/resources/sources.ts">ask</a>({ ...params }) -> SourceAskResponse</code>
- <code title="post /sources/run-extraction">client.sources.<a href="./src/resources/sources.ts">extract</a>({ ...params }) -> SourceExtractResponse</code>
- <code title="get /sources/builds/{build_id}">client.sources.<a href="./src/resources/sources.ts">getBuildStatus</a>(buildID, { ...params }) -> SourceGetBuildStatusResponse</code>
- <code title="get /sources/get-elements">client.sources.<a href="./src/resources/sources.ts">getElements</a>({ ...params }) -> SourceGetElementsResponse</code>
- <code title="get /sources/{file_id}/pages/{page_number}/screenshot">client.sources.<a href="./src/resources/sources.ts">getPageScreenshot</a>(pageNumber, { ...params }) -> SourceGetPageScreenshotResponse</code>
- <code title="post /sources/index">client.sources.<a href="./src/resources/sources.ts">indexBuild</a>({ ...params }) -> SourceIndexBuildResponse</code>
- <code title="post /sources/ingest-file">client.sources.<a href="./src/resources/sources.ts">ingestFile</a>({ ...params }) -> SourceIngestFileResponse</code>
- <code title="post /sources/ingest-github">client.sources.<a href="./src/resources/sources.ts">ingestGitHub</a>({ ...params }) -> SourceIngestGitHubResponse</code>
- <code title="post /sources/ingest-url">client.sources.<a href="./src/resources/sources.ts">ingestURL</a>({ ...params }) -> SourceIngestURLResponse</code>
- <code title="post /sources/ingest-youtube">client.sources.<a href="./src/resources/sources.ts">ingestYoutube</a>({ ...params }) -> SourceIngestYoutubeResponse</code>
- <code title="post /sources/reprocess">client.sources.<a href="./src/resources/sources.ts">reprocess</a>({ ...params }) -> SourceReprocessResponse</code>
- <code title="post /sources/prebuilt-rag">client.sources.<a href="./src/resources/sources.ts">retrieveChunks</a>({ ...params }) -> SourceRetrieveChunksResponse</code>
- <code title="get /sources/folders">client.sources.<a href="./src/resources/sources.ts">listFolders</a>() -> SourceListFoldersResponse</code>
- <code title="post /sources/create-folder">client.sources.<a href="./src/resources/sources.ts">createFolder</a>({ ...params }) -> SourceCreateFolderResponse</code>
- <code title="post /sources/rename-folder">client.sources.<a href="./src/resources/sources.ts">renameFolder</a>({ ...params }) -> SourceRenameFolderResponse</code>
- <code title="post /sources/remove-folder">client.sources.<a href="./src/resources/sources.ts">removeFolder</a>({ ...params }) -> SourceRemoveFolderResponse</code>
- <code title="post /sources/delete-folder">client.sources.<a href="./src/resources/sources.ts">deleteFolder</a>({ ...params }) -> SourceDeleteFolderResponse</code>
- <code title="post /sources/move-sources">client.sources.<a href="./src/resources/sources.ts">move</a>({ ...params }) -> SourceMoveResponse</code>
