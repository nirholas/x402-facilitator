import type { Address, Hex } from 'viem';

export type { Address, Hex } from 'viem';

/** Supported chain IDs */
export type SupportedChainId = 1 | 8453 | 42161 | 84532 | 421614;

/** Network display names */
export type NetworkName = 'ethereum' | 'base' | 'base-sepolia' | 'arbitrum' | 'arbitrum-sepolia';

/** EIP-3009 transferWithAuthorization parameters */
export interface TransferAuthorization {
  from: Address;
  to: Address;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: Hex;
}

/** EIP-2612 permit parameters */
export interface PermitAuthorization {
  owner: Address;
  spender: Address;
  to: Address;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
}

/** x402 v2 payment payload (sent by client in X-PAYMENT header) */
export interface X402PaymentV2 {
  x402Version: 2;
  scheme: 'exact';
  /** CAIP-2 network identifier e.g. "eip155:8453" */
  network: string;
  payload: {
    signature: Hex;
    authorization: {
      from: Address;
      to: Address;
      /** Decimal string */
      value: string;
      /** Decimal string (unix seconds) */
      validAfter: string;
      /** Decimal string (unix seconds) */
      validBefore: string;
      nonce: Hex;
    };
  };
}

/** x402 v1 payment payload (legacy, kept for backward compat) */
export interface X402PaymentV1 {
  x402Version: 1;
  chainId: SupportedChainId;
  token: Address;
  scheme?: 'eip3009' | 'eip2612';
  authorization: TransferAuthorization;
  permit?: PermitAuthorization;
  signature: Hex;
}

export type X402Payment = X402PaymentV2 | X402PaymentV1;

/** Internal normalized payment (after v1/v2 parsing) */
export interface NormalizedPayment {
  chainId: SupportedChainId;
  token?: Address;
  scheme: 'eip3009' | 'eip2612';
  authorization: TransferAuthorization;
  permit?: PermitAuthorization;
  signature: Hex;
}

/** Result of payment verification (internal) */
export interface VerifyResult {
  valid: boolean;
  reason?: string;
  signer?: Address;
}

/** Payment requirements (what the resource server demands) */
export interface PaymentRequirements {
  chainId: SupportedChainId;
  asset: Address;
  payTo: Address;
  maxAmountRequired: bigint;
  expiry?: number;
}

/** x402 v2 verify response — includes accepted field */
export type VerifyResponse =
  | { isValid: true; payer: Address; accepted: Record<string, unknown> }
  | { isValid: false; invalidReason: string; invalidMessage?: string };

/** Result of on-chain settlement */
export interface SettleResult {
  success: boolean;
  txHash?: Hex;
  error?: string;
  chainId: SupportedChainId;
  network?: string;
  blockNumber?: number;
}

/** x402 settle response */
export type SettleResponse =
  | { success: true; transaction: Hex; network: string; payer: Address }
  | { success: false; errorReason: string };

/** Chain configuration */
export interface ChainConfig {
  chainId: SupportedChainId;
  network: NetworkName;
  rpcUrl: string;
  usdcAddress: Address;
  blockExplorerUrl: string;
  blockTimeMs: number;
}

/** Token configuration per chain */
export interface TokenConfig {
  address: Address;
  symbol: string;
  decimals: number;
}

/** Server info response */
export interface FacilitatorInfo {
  name: string;
  version: string;
  x402Version: number;
  facilitatorAddress: Address;
  supportedChains: Array<{
    chainId: SupportedChainId;
    network: string;
    tokens: TokenConfig[];
  }>;
  operator: {
    name: string;
    url: string;
  };
}

/** Health check response */
export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
  uptime: number;
  chains: Array<{
    chainId: SupportedChainId;
    network: string;
    connected: boolean;
    blockNumber?: number;
  }>;
}

/** Configuration for the Facilitator orchestrator */
export interface FacilitatorConfig {
  privateKey: Hex;
  chains: ChainConfig[];
  port: number;
  host: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  corsOrigins: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
