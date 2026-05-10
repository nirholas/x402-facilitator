import type { Address, SupportedChainId } from '../types/index.js';

/** Settlement scheme — how the facilitator moves tokens on-chain */
export type SettlementScheme = 'eip3009' | 'eip2612';

export interface TokenInfo {
  symbol: string;
  address: Address;
  decimals: number;
  /** EIP-712 domain name for this token */
  domainName: string;
  /** EIP-712 domain version for this token */
  domainVersion: string;
  /** Settlement mechanism: eip3009 (transferWithAuthorization) or eip2612 (permit + transferFrom) */
  scheme: SettlementScheme;
}

/**
 * Supported tokens per chain.
 * USDC uses EIP-3009 (transferWithAuthorization).
 * USDs uses EIP-2612 (permit + transferFrom) — domain name is "Sperax USD" (on-chain EIP-712 domain, cannot change).
 * SPA is standard ERC20 without EIP-2612 — not included as a settlement token.
 */
const TOKEN_REGISTRY: Record<SupportedChainId, TokenInfo[]> = {
  1: [
    {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      domainName: 'USD Coin',
      domainVersion: '2',
      scheme: 'eip3009',
    },
  ],
  8453: [
    {
      symbol: 'USDC',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      domainName: 'USD Coin',
      domainVersion: '2',
      scheme: 'eip3009',
    },
  ],
  84532: [
    {
      symbol: 'USDC',
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      decimals: 6,
      domainName: 'USD Coin',
      domainVersion: '2',
      scheme: 'eip3009',
    },
  ],
  42161: [
    {
      symbol: 'USDC',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      domainName: 'USD Coin',
      domainVersion: '2',
      scheme: 'eip3009',
    },
    {
      symbol: 'USDs',
      address: '0xD74f5255D557944cf7Dd0E45FF521520002D5748',
      decimals: 18,
      domainName: 'Sperax USD',
      domainVersion: '1',
      scheme: 'eip2612',
    },
  ],
  421614: [
    {
      symbol: 'USDC',
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      decimals: 6,
      domainName: 'USD Coin',
      domainVersion: '2',
      scheme: 'eip3009',
    },
  ],
};

/**
 * Get tokens supported on a chain.
 */
export function getTokensForChain(chainId: SupportedChainId): TokenInfo[] {
  return TOKEN_REGISTRY[chainId] ?? [];
}

/**
 * Get a specific token config by chain and address.
 */
export function getTokenConfig(chainId: SupportedChainId, address: Address): TokenInfo | undefined {
  return TOKEN_REGISTRY[chainId]?.find((t) => t.address.toLowerCase() === address.toLowerCase());
}

/**
 * Get the EIP-712 domain for a token on a chain.
 * Used by the verifier for signature recovery.
 */
export function getTokenDomain(tokenAddress: Address, chainId: SupportedChainId) {
  const tokens = TOKEN_REGISTRY[chainId];
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
  );

  if (!token) {
    throw new Error(`Unsupported token ${tokenAddress} on chain ${chainId}`);
  }

  return {
    name: token.domainName,
    version: token.domainVersion,
    chainId: BigInt(chainId),
    verifyingContract: token.address,
  } as const;
}
