---
name: run-x402-facilitator
description: Run the three.ws x402 facilitator and call its HTTP API to verify and settle x402 v2 EIP-3009 USDC payments on EVM chains. Use when a paid endpoint needs a facilitator to check a buyer's signed payment and settle it on-chain.
---

# Run and call the x402 facilitator

This plugin is a skill only. There is no MCP server and no published package. The service is a Hono app in this repo (TypeScript, run with `tsx`). It verifies EIP-3009 `transferWithAuthorization` signatures off-chain and settles them on-chain with its own gas wallet. Supported chains in the README: Base (`eip155:8453`), Arbitrum (`eip155:42161`) and Ethereum (`eip155:1`).

## Run it from a clone

```
git clone https://github.com/nirholas/x402-facilitator
cd x402-facilitator
cp .env.example .env
npm install
npm run dev        # tsx watch src/index.ts; npm start runs it once
```

Settings in `.env` (see `.env.example`):

- `FACILITATOR_PRIVATE_KEY` (required): a 32-byte `0x` hex key for the settlement wallet. It pays gas, so it needs a little native balance on each enabled chain. The user creates and funds it. Never ask for it in chat, never print it, never commit `.env`.
- `BASE_RPC_URL`, `ARBITRUM_RPC_URL`, `ETHEREUM_RPC_URL` (optional): RPC endpoints, with public defaults.
- `ENABLE_BASE`, `ENABLE_ARBITRUM`, `ENABLE_ETHEREUM` (default true), plus `ENABLE_BASE_SEPOLIA` and `ENABLE_ARBITRUM_SEPOLIA` (default false) for testnets.
- `PORT` (default 3402), `HOST`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`, `CORS_ORIGINS`, `LOG_LEVEL`.

Other scripts: `npm test` (vitest), `npm run typecheck`, `npm run lint`, `npm run build`. A `Dockerfile` and `docker-compose.yml` are in the repo root. The README lists a hosted instance at `https://facilitator.three.ws`.

## HTTP API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness and chain connectivity |
| `GET` | `/info` | Facilitator metadata |
| `GET` | `/supported` | Supported payment kinds: `{ kinds: [{ x402Version, scheme, network, ... }] }` |
| `POST` | `/verify` | Verify a signed payment off-chain |
| `POST` | `/settle` | Settle a payment on-chain |
| `GET` | `/balances` | Gas and USDC balances per chain |
| `GET` | `/fees` | Estimated settlement cost |
| `GET` | `/metrics` | Counts, latency percentiles, uptime |
| `GET` | `/status/:txHash` | Transaction status |
| `GET` | `/.well-known/x402` | x402 discovery |

`/verify` and `/settle` take the same JSON body: `{ "paymentPayload": ..., "paymentRequirements": ... }`.

- v2 `paymentPayload`: `{ "x402Version": 2, "scheme": "exact", "network": "eip155:8453", "payload": { "signature": "0x...", "authorization": { "from", "to", "value", "validAfter", "validBefore", "nonce" } } }`. A v1 shape with `chainId` and `asset` is also accepted by `/verify`.
- `paymentRequirements`: `{ "payTo", "maxAmountRequired", "asset", "chainId", ... }`. `payTo` and `asset` are EVM addresses, amounts are atomic-unit strings.
- `/verify` answers 200 with `isValid: true`, or 400 when invalid. `/settle` answers 200 when `success` is true, or 402 when it is not.

## Procedure for a paid endpoint

1. `GET /supported` to confirm the chain and asset you plan to advertise.
2. On each paid request, call `POST /verify`. Run the work only when `isValid` is true.
3. After the work succeeds, call `POST /settle` and return the transaction hash to the buyer. Use `GET /status/:txHash` to check it later.

Settlement moves real funds. Before pointing a production service at a facilitator, tell the user which instance it is and which chains are enabled.
