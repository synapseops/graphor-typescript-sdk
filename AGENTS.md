# Graphor TypeScript SDK: agent contract

The official TypeScript client for the Graphor public API, published to npm as `graphor`, and the MCP server, published as `graphor-mcp`. This file is the contract for any agent or engineer working here. The release procedure is in [RELEASING.md](RELEASING.md).

## This repository is public

Everything here is visible to anyone, including commits, branch names, pull requests and their history. A push cannot be taken back.

- Write only about the public API and the behavior of this SDK.
- Refer only to what a reader of this repository can open. Never mention internal systems, hostnames, infrastructure, costs or customers.
- A pull request or a commit says what changes for someone using the SDK. It does not explain internal reasons or link to anything private.
- Never commit secrets, tokens or `.env` files.

## This code is maintained by hand

The code was once generated and no longer is, so every change is made by hand. The header `File generated from our OpenAPI spec` on many files is historical: those files can be edited like any other.

## Layout

- `src/resources/sources.ts`: the API methods and their types.
- `src/client.ts`: the client, retries and transport.
- `api.md`: the list of public methods and types.
- `packages/mcp-server/`: the MCP server, its tools and its instructions.
- `tests/api-resources/`: one test per method. `tests/`: client and utility tests.
- `examples/`: usage examples.

## Commands

| Task                 | Command               |
| -------------------- | --------------------- |
| Install dependencies | `./scripts/bootstrap` |
| Lint and types       | `./scripts/lint`      |
| Build                | `./scripts/build`     |
| Tests                | `./scripts/test`      |
| Format               | `./scripts/format`    |

The gates are lint, build and tests. CI runs them on every push. The MCP server's own tests in `packages/mcp-server/tests` are not part of them: run them with `pnpm test` in that directory when changing it.

## Tests do not cover the endpoints

Every test in `tests/api-resources/` is skipped, so a green run says nothing about whether a method works against the API. A new or changed method must be exercised by hand against the API before a release, and the pull request says how.

## Changing the API surface

The TypeScript and Python SDKs expose the same API, so a change here has a matching change in [graphor-python-sdk](https://github.com/synapseops/graphor-python-sdk).

- Same method and parameter names, adapted only to each language's conventions.
- A change here updates the method, its types, `api.md`, its test, the README when it mentions it, and the MCP server's tools and instructions when they cover it.
- Removing or renaming anything public is a breaking change: call it out in the changelog.

## Git

- Work on a branch and open a pull request. Never push to `main`; a maintainer merges.
- Commits use a conventional subject (`feat:`, `fix:`, `docs:`, `chore:`).
- Stage files by name. Before pushing, read the diff for anything the section on this repository being public forbids.
- Changes that are not user-visible do not need a release.
