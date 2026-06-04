/**
 * @notice IPFS helper for Echo PoC submissions.
 * @dev Production usage: integrate Web3.Storage or Pinata SDK.
 */

export async function uploadToIPFS(
  content: Buffer | string,
  filename: string
): Promise<string> {
  // Placeholder for actual Web3.Storage upload.
  // In production, use:
  // const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
  // const cid = await client.put(files);
  console.log(`[IPFS] Upload requested: ${filename}`);
  return `Qm${Buffer.from(filename).toString("hex").slice(0, 44)}`;
}

export function ipfsGatewayURL(cid: string): string {
  const gateway = process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs";
  return `${gateway}/${cid}`;
}
