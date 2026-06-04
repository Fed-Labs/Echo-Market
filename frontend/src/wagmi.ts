import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

// Default to Base Sepolia for testnet deployments; override with VITE_CHAIN=base for mainnet
const targetChain = import.meta.env.VITE_CHAIN === "base" ? base : baseSepolia;

export const config = createConfig({
  chains: [targetChain],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(import.meta.env.VITE_RPC_URL),
  } as any,
});
