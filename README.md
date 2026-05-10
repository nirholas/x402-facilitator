# three.ws x402 Facilitator

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
