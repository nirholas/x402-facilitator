import { Hono } from 'hono';

import type { Facilitator } from '../core/facilitator.js';
import type { FacilitatorConfig, FacilitatorInfo, SupportedChainId } from '../types/index.js';
import { getNetworkName } from '../config/chains.js';
import { getTokensForChain } from '../config/tokens.js';

export function createInfoRoute(facilitator: Facilitator, config: FacilitatorConfig): Hono {
  const route = new Hono();

  route.get('/', (c) => {
    const info: FacilitatorInfo = {
      name: 'three.ws x402 Facilitator',
      version: FACILITATOR_VERSION,
      x402Version: 2,
      facilitatorAddress: facilitator.getAddress(),
      supportedChains: config.chains.map((chain) => ({
        chainId: chain.chainId as SupportedChainId,
        network: getNetworkName(chain.chainId),
        tokens: getTokensForChain(chain.chainId),
      })),
      operator: {
        name: 'three.ws',
        url: 'https://three.ws',
      },
    };

    return c.json(info);
  });

  return route;
}
