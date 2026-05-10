import type { Address, NetworkName } from './types/index.js';

/** Facilitator version (semver) */
export const FACILITATOR_VERSION = '2.0.0';

/** x402 protocol version supported */
export const X402_VERSION = 2;

/** Supported payment schemes */
export const SUPPORTED_SCHEMES = ['exact'] as const;

/** Supported network names */
export const SUPPORTED_NETWORKS: readonly NetworkName[] = [
  'base',
  'base-sepolia',
  'arbitrum',
  'arbitrum-sepolia',
  'ethereum',
] as const;

/** USDC contract addresses per network */
export const USDC_ADDRESSES: Record<string, Address> = {
  'ethereum': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'arbitrum': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  'arbitrum-sepolia': '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
};

/** Maximum payment amount in USDC (raw units, 6 decimals) — $10,000 */
export const MAX_PAYMENT_AMOUNT = 10_000_000_000n;

/** Minimum payment amount in USDC (raw units, 6 decimals) — $0.001 */
export const MIN_PAYMENT_AMOUNT = 1_000n;
