# AGENTS.md

Operating notes for AI coding agents (Claude Code, Codex, Cursor, Copilot and others) working in this repository. Everything here is derived from the files actually in the tree, so trust it over guesses, and update it when the facts change.

## What this repository is

x402 payment facilitator - verifies and settles EIP-3009 micropayments multichain. v2 facilitator.

- Source: https://github.com/nirholas/x402-facilitator
- Primary language: TypeScript
- License: Other (see the LICENSE file)

## Repository layout

- `docs/`
- `src/`
- `tests/`
- `README.md`
- `LICENSE`
- `package.json`
- `Dockerfile`

Tests live in `tests/`. Add or update a test next to the code you change.

## Setup

```bash
pnpm install
```

## Commands

| Task | Command |
|---|---|
| dev | `pnpm run dev` |
| start | `pnpm start` |
| build | `pnpm run build` |
| test | `pnpm test` |
| lint | `pnpm run lint` |
| typecheck | `pnpm run typecheck` |
| run with Docker | `docker compose up` |
| build image | `docker build .` |

Run the test and lint commands above before you consider a change finished. If a command fails on code you did not touch, say so in your report instead of silently skipping it.

## Conventions

- TypeScript runs in strict mode; do not loosen `tsconfig.json` to make an error go away.
- `.env` files are gitignored; never commit credentials, and read configuration from environment variables.
- Read the surrounding code before adding to it, and match its naming, file organisation and error-handling style.
- Keep `README.md` accurate: if a change alters behaviour, commands or configuration, update the docs in the same commit.
- Do not leave TODO comments, stub functions, placeholder data or commented-out code behind. Finish what you start or leave it out.
- Small, focused commits with a subject line that describes the change, not the act of committing.

## Where to raise things

- Bugs and feature requests: https://github.com/nirholas/x402-facilitator/issues
- Questions and ideas: https://github.com/nirholas/x402-facilitator/discussions
- Security issues: report privately at https://github.com/nirholas/x402-facilitator/security/advisories/new, never in a public issue.
