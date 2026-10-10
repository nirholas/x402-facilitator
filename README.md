# three.ws x402 Facilitator

<!-- three.ws:badges -->
[![GitHub stars](https://img.shields.io/github/stars/nirholas/x402-facilitator?style=flat&logo=github)](https://github.com/nirholas/x402-facilitator/stargazers) [![Last commit](https://img.shields.io/github/last-commit/nirholas/x402-facilitator?style=flat)](https://github.com/nirholas/x402-facilitator/commits) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat)](https://github.com/nirholas/x402-facilitator/pulls) [![AI agent friendly](https://img.shields.io/badge/AI%20agents-AGENTS.md%20%2B%20llms.txt-6d5dfc?style=flat)](https://github.com/nirholas/x402-facilitator/blob/HEAD/AGENTS.md)
<!-- /three.ws:badges -->


Verify and settle x402 v2 micropayments (USDC) on EVM chains. Powers `https://three.ws/pay`.

**Live endpoint:** `https://facilitator.three.ws`

## Supported chains

| Chain | Network | USDC address |
|-------|---------|-------------|
| Base | eip155:8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Arbitrum | eip155:42161 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| Ethereum | eip155:1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |

## Quick start

```bash
git clone https://github.com/nirholas/x402-facilitator
cd x402-facilitator
cp .env.example .env
# Set FACILITATOR_PRIVATE_KEY and fund it with ETH on each chain
npm install
npm run dev
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness + chain connectivity |
| GET | `/info` | Facilitator metadata |
| GET | `/supported` | Supported payment kinds |
| POST | `/verify` | Verify EIP-3009 signature off-chain |
| POST | `/settle` | Settle payment on-chain |
| GET | `/balances` | Gas + USDC balances per chain |
| GET | `/fees` | Estimated settlement cost |
| GET | `/metrics` | Verification/settlement counts, latency percentiles, uptime |
| GET | `/status/:txHash` | Transaction status |
| GET | `/.well-known/x402` | x402 discovery |

## x402Version 2 payload format

```json
{
  "x402Version": 2,
  "scheme": "exact",
  "network": "eip155:8453",
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x<payer>",
      "to": "0x<payTo>",
      "value": "1000",
      "validAfter": "0",
      "validBefore": "1234567890",
      "nonce": "0x<32 random bytes>"
    }
  }
}
```

## Deployment

Deploy to Railway — set `FACILITATOR_PRIVATE_KEY` and fund the address with ETH on Base, Arbitrum, and Ethereum for gas. Add custom domain `facilitator.three.ws`.

## Operator

[three.ws](https://three.ws) — AI agent infrastructure

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=nirholas/x402-facilitator&type=Date)](https://www.star-history.com/#nirholas/x402-facilitator&Date)

<!-- three.ws:growth -->
## Support the project

If x402-facilitator saves you time, **[star it on GitHub](https://github.com/nirholas/x402-facilitator)**. Stars are how other developers and AI agents find the repositories worth trusting, and they cost you one click.

Know someone who would use it? [Post on X](https://twitter.com/intent/tweet?text=x402-facilitator%3A%20x402%20payment%20facilitator%3A%20verifies%20and%20settles%20EIP-3009%20micropayments%20multichain&url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fx402-facilitator) · [Share on Bluesky](https://bsky.app/intent/compose?text=x402-facilitator%3A%20x402%20payment%20facilitator%3A%20verifies%20and%20settles%20EIP-3009%20micropayments%20multichain%20https%3A%2F%2Fgithub.com%2Fnirholas%2Fx402-facilitator) · [Share on LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fx402-facilitator) · [Submit to Hacker News](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fgithub.com%2Fnirholas%2Fx402-facilitator&t=x402-facilitator%3A%20x402%20payment%20facilitator%3A%20verifies%20and%20settles%20EIP-3009%20micropayments%20multichain) · [Share on Reddit](https://www.reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fx402-facilitator&title=x402-facilitator%3A%20x402%20payment%20facilitator%3A%20verifies%20and%20settles%20EIP-3009%20micropayments%20multichain)

## Built for AI agents too

Coding agents and LLM tooling can read this repo directly: [AGENTS.md](./AGENTS.md), [llms.txt](./llms.txt), [llms-full.txt](./llms-full.txt). Point an agent at `https://github.com/nirholas/x402-facilitator` and it has the context it needs.

## More from the same author

- [All repositories by nirholas](https://github.com/nirholas/nirholas#readme): the full catalog, grouped by topic
- [three.ws](https://three.ws): the platform for 3D AI agents with Solana wallets, a skill marketplace and x402 payments
- Questions or ideas: [open an issue](https://github.com/nirholas/x402-facilitator/issues) or [start a discussion](https://github.com/nirholas/x402-facilitator/discussions)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=nirholas/x402-facilitator)](https://github.com/nirholas/x402-facilitator/graphs/contributors)

<!-- /three.ws:growth -->
