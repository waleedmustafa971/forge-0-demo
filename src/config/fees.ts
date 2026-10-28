import { readFileSync } from 'node:fs';

export interface Fees {
  /** Charged on orders below `freeHandlingThreshold`. */
  handlingFee: number;
  /** Charged once per order when gift wrapping is requested. */
  giftWrapFee: number;
  freeHandlingThreshold: number;
}

const FEES_FILE = new URL('../../config/fees.json', import.meta.url);

/** Operational fees, edited by the operations team without a deploy (`config/fees.json`). */
export function loadFees(file: URL = FEES_FILE): Fees {
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  return {
    handlingFee: Number(raw.handlingFee),
    giftWrapFee: Number(raw.giftWrapFee),
    freeHandlingThreshold: Number(raw.freeHandlingThreshold),
  };
}
