# Releasing

A published version cannot be replaced or changed. If one is wrong, publish a new one with the fix. Publishing is a deliberate step taken by a maintainer.

This repository publishes two packages with the same version: `graphor` and `graphor-mcp`.

## Choosing the version

The SDK is before 1.0, so: a new feature or a breaking change bumps the minor (`0.23.0` to `0.24.0`), and a fix or a documentation change bumps the patch (`0.23.0` to `0.23.1`).

## Steps

1. On a branch `release/vX.Y.Z`, update the version in all five places:
   - `package.json`
   - `src/version.ts`
   - `packages/mcp-server/package.json`
   - `packages/mcp-server/manifest.json`
   - `packages/mcp-server/src/server.ts`
2. Add the section to `CHANGELOG.md`, written for someone using the SDK. Call out breaking changes.
3. Run `bin/check-release-version X.Y.Z` and the gates: `./scripts/lint`, `./scripts/build`, `./scripts/test`.
4. Open a pull request and merge it.
5. Create the release from `main`, with a tag matching the version:

   ```sh
   gh release create vX.Y.Z --target main --title "vX.Y.Z" --notes-file <notes>
   ```

   Create it with a person's credentials: a release made with the default `GITHUB_TOKEN` of a workflow does not start other workflows.

6. Follow the `Publish NPM` workflow, which runs on the published release. It first checks that the tag matches every version location, and fails before publishing if not. It then publishes both packages using npm trusted publishing and attaches the MCP bundle to the release.

## Verifying

```sh
npm view graphor version
npm view graphor-mcp version
```

Both must print the new version.

## If something goes wrong

- **The version check failed:** the tag points at a commit with the wrong version. Nothing was published. Release a new patch version; do not move the tag.
- **The workflow failed before publishing anything, for another reason:** fix the cause and run it from the Actions tab (`workflow_dispatch`) once for each path, `.` and `packages/mcp-server`, picking the tag under "Use workflow from". It refuses to run from a branch.
- **Only one package was published:** run it the same way for the missing path only.
- **Both were published but the bundle was not attached:** a manual run does not attach it. Build it from the tag and upload it: `git checkout vX.Y.Z && ./scripts/bootstrap && ./scripts/build && gh release upload vX.Y.Z packages/mcp-server/graphor_api.mcpb`.
- **A published version is broken:** publish a fixed version, then deprecate the broken one with `npm deprecate`.
