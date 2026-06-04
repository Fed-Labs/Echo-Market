import { keccak256, toBytes, parseUnits } from "viem";

/**
 * Hash an IPFS CID string to bytes32 for the contract.
 */
export function cidToBytes32(cid: string): `0x${string}` {
  return keccak256(toBytes(cid));
}

/**
 * Convert human-readable USDC to contract units (6 decimals).
 */
export function usdcToUnits(amount: string): bigint {
  return parseUnits(amount, 6);
}

/**
 * Validate an Ethereum address.
 */
export function isAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
