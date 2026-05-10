import { z } from 'zod';

import type { SupportedChainId } from '../types/index.js';

const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum address');
const hexSchema = z.string().regex(/^0x[0-9a-fA-F]+$/, 'Invalid hex string');

const chainIdSchema = z.union([
  z.literal(1),
  z.literal(8453),
  z.literal(84532),
  z.literal(42161),
  z.literal(421614),
]);

const numericStringSchema = z.string().refine(
  (v) => /^\d+$/.test(v) || /^0x[0-9a-fA-F]+$/.test(v),
  'Must be a numeric or hex string',
);

/** EIP-3009 authorization params (shared between v1 and v2) */
const authorizationSchema = z.object({
  from: addressSchema,
  to: addressSchema,
  value: numericStringSchema,
  validAfter: numericStringSchema,
  validBefore: numericStringSchema,
  nonce: hexSchema,
});

/** x402 v2 payment payload schema */
const paymentPayloadV2Schema = z.object({
  x402Version: z.literal(2),
  scheme: z.literal('exact'),
  network: z.string().regex(/^eip155:\d+$/, 'Network must be CAIP-2 format e.g. eip155:8453'),
  payload: z.object({
    signature: hexSchema,
    authorization: authorizationSchema,
  }),
});

/** x402 v1 payment payload schema (backward compat) */
const paymentPayloadV1Schema = z.object({
  x402Version: z.literal(1),
  authorization: authorizationSchema,
  signature: hexSchema,
  chainId: chainIdSchema,
  asset: addressSchema,
});

/** Accept both v1 and v2 */
export const paymentPayloadSchema = z.union([paymentPayloadV2Schema, paymentPayloadV1Schema]);

/** Payment requirements from 402 response */
export const paymentRequiredSchema = z.object({
  payTo: addressSchema,
  maxAmountRequired: numericStringSchema,
  asset: addressSchema,
  chainId: chainIdSchema,
  description: z.string().optional(),
  resource: z.string().url().optional(),
  expiry: z.number().int().positive().optional(),
}).passthrough();

export type PaymentPayload = z.infer<typeof paymentPayloadSchema>;
export type PaymentRequired = z.infer<typeof paymentRequiredSchema>;

/**
 * Decode a potentially base64-encoded payment payload.
 * x402 clients base64-encode the JSON before putting it in the X-PAYMENT header.
 */
export function decodePaymentPayload(raw: unknown): unknown {
  if (typeof raw === 'string') {
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
  }
  return raw;
}

/**
 * Normalize a v2 CAIP-2 network string to a chain ID.
 * "eip155:8453" → 8453
 */
export function networkToChainId(network: string): SupportedChainId {
  const parts = network.split(':');
  if (parts.length !== 2 || parts[0] !== 'eip155') {
    throw new Error(`Unsupported network format: ${network}`);
  }
  const chainId = parseInt(parts[1], 10);
  if (isNaN(chainId)) throw new Error(`Invalid chain ID in network: ${network}`);
  return chainId as SupportedChainId;
}
