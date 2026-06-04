import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { ECHO_FACTORY_ABI, ECHO_MARKET_ABI } from "../utils/contracts";

const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS as `0x${string}`;

export interface MarketData {
  address: `0x${string}`;
  name: string;
  protocol: `0x${string}`;
  totalShort: bigint;
  totalLong: bigint;
  riskScore: number;
  status: number;
}

export function useMarkets() {
  const { data: count, isLoading: countLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: ECHO_FACTORY_ABI,
    functionName: "marketCount",
    query: { enabled: !!FACTORY_ADDRESS },
  });

  const marketIndices = useMemo(() => {
    if (!count) return [];
    return Array.from({ length: Number(count) }, (_, i) => BigInt(i));
  }, [count]);

  const marketAddressCalls = useMemo(() => {
    if (!FACTORY_ADDRESS || marketIndices.length === 0) return [];
    return marketIndices.map((index) => ({
      address: FACTORY_ADDRESS,
      abi: ECHO_FACTORY_ABI,
      functionName: "allMarkets" as const,
      args: [index],
    }));
  }, [marketIndices]);

  const { data: addressesResult, isLoading: addrLoading } = useReadContracts({
    contracts: marketAddressCalls,
    query: { enabled: marketAddressCalls.length > 0 },
  });

  const marketAddresses = useMemo(() => {
    if (!addressesResult) return [];
    return addressesResult
      .filter((r): r is { result: `0x${string}`; status: "success" } => r.status === "success" && !!r.result)
      .map((r) => r.result);
  }, [addressesResult]);

  const marketDataCalls = useMemo(() => {
    if (marketAddresses.length === 0) return [];
    return marketAddresses.flatMap((addr) => [
      { address: addr, abi: ECHO_MARKET_ABI, functionName: "name" as const },
      { address: addr, abi: ECHO_MARKET_ABI, functionName: "protocol" as const },
      { address: addr, abi: ECHO_MARKET_ABI, functionName: "totalShort" as const },
      { address: addr, abi: ECHO_MARKET_ABI, functionName: "totalLong" as const },
      { address: addr, abi: ECHO_MARKET_ABI, functionName: "status" as const },
      { address: addr, abi: ECHO_MARKET_ABI, functionName: "currentRiskScore" as const },
    ]);
  }, [marketAddresses]);

  const { data: marketResults, isLoading: dataLoading } = useReadContracts({
    contracts: marketDataCalls,
    query: { enabled: marketDataCalls.length > 0 },
  });

  const markets = useMemo((): MarketData[] => {
    if (!marketResults || marketAddresses.length === 0) return [];
    const perMarket = 6;
    return marketAddresses.map((addr, i) => {
      const base = i * perMarket;
      const name = marketResults[base]?.result as string | undefined;
      const protocol = marketResults[base + 1]?.result as `0x${string}` | undefined;
      const totalShort = marketResults[base + 2]?.result as bigint | undefined;
      const totalLong = marketResults[base + 3]?.result as bigint | undefined;
      const status = marketResults[base + 4]?.result as number | undefined;
      const riskScore = marketResults[base + 5]?.result as bigint | undefined;
      return {
        address: addr,
        name: name || "Unknown Market",
        protocol: protocol || "0x0000000000000000000000000000000000000000",
        totalShort: totalShort || 0n,
        totalLong: totalLong || 0n,
        riskScore: riskScore ? Number(riskScore) / 1e18 : 0,
        status: status ?? 0,
      };
    });
  }, [marketResults, marketAddresses]);

  return {
    markets,
    isLoading: countLoading || addrLoading || dataLoading,
  };
}
