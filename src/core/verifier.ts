import {
  type Address,
  type Hex,
  createPublicClient,
  http,
  verifyTypedData,
} from 'viem';
import { base, arbitrum, mainnet, baseSepolia, arbitrumSepolia } from 'viem/chains';

import type { SupportedChainId, VerifyResult, X402Payment, PaymentRequirements, NormalizedPayment } from '../types/index.js';
import { getChainConfig } from '../config/chains.js';
import { getTokenConfig, getTokenDomain, type SettlementScheme } from '../config/tokens.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { networkToChainId } from '../middleware/validate.js';

const chainMap = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  84532: baseSepolia,
  421614: arbitrumSepolia,
} as const;

const rpcUrlMap: Record<number, string | undefined> = {
  1: env.ETHEREUM_RPC_URL,
  8453: env.BASE_RPC_URL,
  42161: env.ARBITRUM_RPC_URL,
  84532: env.BASE_SEPOLIA_RPC_URL,
  421614: env.ARBITRUM_SEPOLIA_RPC_URL,
};

const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

const PERMIT_TYPES = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

function getClient(chainId: SupportedChainId) {
  const rpcUrl = rpcUrlMap[chainId];
  if (!rpcUrl) throw new Error(`No RPC URL configured for chain ${chainId}`);
  return createPublicClient({ chain: chainMap[chainId], transport: http(rpcUrl) });
}

/**
 * Normalize x402 v1 or v2 payment into a common internal format.
 * v2 uses CAIP-2 network strings and decimal string values.
 * v1 uses chainId integers and bigint values directly.
 */
function normalizePayment(payment: X402Payment, tokenFromRequirements?: Address): NormalizedPayment {
  if (payment.x402Version === 2) {
    const chainId = networkToChainId(payment.network);
    const { authorization, signature } = payment.payload;
    return {
      chainId,
      token: tokenFromRequirements,
      scheme: 'eip3009',
      authorization: {
        from: authorization.from as Address,
        to: authorization.to as Address,
        value: BigInt(authorization.value),
        validAfter: BigInt(authorization.validAfter),
        validBefore: BigInt(authorization.validBefore),
        nonce: authorization.nonce as Hex,
      },
      signature: signature as Hex,
    };
  }

  // v1 — values already in correct format
  return {
    chainId: payment.chainId,
    token: payment.token,
    scheme: payment.scheme ?? 'eip3009',
    authorization: payment.authorization,
    permit: payment.permit,
    signature: payment.signature,
  };
}

export class PaymentVerifier {
  async verify(payment: X402Payment, requirements: PaymentRequirements): Promise<VerifyResult> {
    const normalized = normalizePayment(payment, requirements.asset);
    const { chainId, authorization, signature, scheme, permit } = normalized;
    const token = normalized.token ?? requirements.asset;

    if (chainId !== requirements.chainId) {
      return { valid: false, reason: 'Chain ID mismatch' };
    }

    if (token.toLowerCase() !== requirements.asset.toLowerCase()) {
      return { valid: false, reason: 'Asset mismatch' };
    }

    if (authorization.to.toLowerCase() !== requirements.payTo.toLowerCase()) {
      return { valid: false, reason: 'Recipient mismatch' };
    }

    if (authorization.value < requirements.maxAmountRequired) {
      return { valid: false, reason: 'Insufficient payment amount' };
    }

    const now = BigInt(Math.floor(Date.now() / 1000));

    if (scheme === 'eip2612' && permit) {
      if (permit.deadline <= now) {
        return { valid: false, reason: 'Permit deadline expired' };
      }
    } else {
      if (authorization.validAfter > now) {
        return { valid: false, reason: 'Authorization not yet valid' };
      }
      if (authorization.validBefore <= now) {
        return { valid: false, reason: 'Authorization expired' };
      }
    }

    if (requirements.expiry != null && requirements.expiry <= Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'Payment requirement expired' };
    }

    if (authorization.value <= 0n) {
      return { valid: false, reason: 'Value must be positive' };
    }

    try {
      getChainConfig(chainId);
    } catch {
      return { valid: false, reason: `Unsupported chain: ${chainId}` };
    }

    const tokenConfig = getTokenConfig(chainId, token);
    if (!tokenConfig) {
      return { valid: false, reason: `No EIP-712 domain for token ${token} on chain ${chainId}` };
    }

    try {
      const domain = getTokenDomain(token, chainId);
      let valid: boolean;
      let signer: Address;

      if (scheme === 'eip2612' && permit) {
        valid = await verifyTypedData({
          address: permit.owner,
          domain,
          types: PERMIT_TYPES,
          primaryType: 'Permit',
          message: { owner: permit.owner, spender: permit.spender, value: permit.value, nonce: permit.nonce, deadline: permit.deadline },
          signature,
        });
        signer = permit.owner;
      } else {
        valid = await verifyTypedData({
          address: authorization.from,
          domain,
          types: TRANSFER_WITH_AUTHORIZATION_TYPES,
          primaryType: 'TransferWithAuthorization',
          message: { from: authorization.from, to: authorization.to, value: authorization.value, validAfter: authorization.validAfter, validBefore: authorization.validBefore, nonce: authorization.nonce },
          signature,
        });
        signer = authorization.from;
      }

      if (!valid) {
        return { valid: false, reason: 'Invalid signature — signer does not match from address' };
      }

      logger.info(`Payment verified: ${signer} → ${authorization.to} (${authorization.value} on chain ${chainId})`);
      return { valid: true, signer };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown verification error';
      return { valid: false, reason: message };
    }
  }
}

export async function verifyPayment(payment: X402Payment): Promise<VerifyResult> {
  const normalized = normalizePayment(payment);
  const { chainId, authorization, signature, scheme, permit, token } = normalized;

  if (!token) return { valid: false, reason: 'Token address required' };

  try {
    getChainConfig(chainId);
  } catch {
    return { valid: false, reason: `Unsupported chain: ${chainId}` };
  }

  const tokenConfig = getTokenConfig(chainId, token);
  if (!tokenConfig) {
    return { valid: false, reason: `Unsupported token ${token} on chain ${chainId}` };
  }

  const now = BigInt(Math.floor(Date.now() / 1000));

  if (scheme === 'eip2612' && permit) {
    if (permit.deadline <= now) return { valid: false, reason: 'Permit deadline has expired' };
  } else {
    if (authorization.validAfter > now) return { valid: false, reason: 'Authorization not yet valid' };
    if (authorization.validBefore <= now) return { valid: false, reason: 'Authorization has expired' };
  }

  const value = permit?.value ?? authorization.value;
  if (value <= 0n) return { valid: false, reason: 'Value must be positive' };

  try {
    const domain = getTokenDomain(token, chainId);
    let valid: boolean;
    let signer: Address;

    if (scheme === 'eip2612' && permit) {
      valid = await verifyTypedData({
        address: permit.owner, domain, types: PERMIT_TYPES, primaryType: 'Permit',
        message: { owner: permit.owner, spender: permit.spender, value: permit.value, nonce: permit.nonce, deadline: permit.deadline },
        signature,
      });
      signer = permit.owner;
    } else {
      valid = await verifyTypedData({
        address: authorization.from, domain, types: TRANSFER_WITH_AUTHORIZATION_TYPES, primaryType: 'TransferWithAuthorization',
        message: { from: authorization.from, to: authorization.to, value: authorization.value, validAfter: authorization.validAfter, validBefore: authorization.validBefore, nonce: authorization.nonce },
        signature,
      });
      signer = authorization.from;
    }

    if (!valid) return { valid: false, reason: 'Invalid signature' };

    const client = getClient(chainId);
    const balance = await client.readContract({
      address: token,
      abi: [{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'balanceOf',
      args: [signer],
    }) as bigint;

    if (balance < value) return { valid: false, reason: 'Insufficient token balance', signer };

    logger.info(`Payment verified: ${signer} → ${permit?.to ?? authorization.to} (${value} on chain ${chainId})`);
    return { valid: true, signer };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown verification error';
    logger.error(`Verification failed: ${message}`);
    return { valid: false, reason: message };
  }
}
