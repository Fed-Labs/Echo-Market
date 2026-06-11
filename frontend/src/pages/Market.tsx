import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits, formatUnits } from "viem";
import { ECHO_MARKET_ABI, USDC_ABI } from "../utils/contracts";
import { RiskGauge } from "../components/RiskGauge";
import { showToast } from "../components/Toast";
import { renderMarkdown } from "../utils/markdown";

const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`;

export function Market() {
  const { address } = useParams<{ address: string }>();
  const { address: user } = useAccount();
  const [posType, setPosType] = useState<0 | 1>(0);
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const marketAddress = address as `0x${string}`;

  const { data: marketName } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "name",
  });

  const { data: marketSymbol } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "symbol",
  });

  const { data: marketDescription } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "description",
  });

  const { data: marketProtocol } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "protocol",
  });

  const { data: riskScore } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "currentRiskScore",
  });

  const { data: totalShort } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "totalShort",
  });

  const { data: totalLong } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "totalLong",
  });

  const { data: status } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "status",
  });

  const { data: openingTime } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "openingTime",
  });

  const { data: windowDuration } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "windowDuration",
  });

  const { data: earlyExitBps } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "earlyExitBps",
  });

  const { data: protocolFeeBps } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "PROTOCOL_FEE_BPS",
  });

  const { data: positionCount } = useReadContract({
    address: marketAddress,
    abi: ECHO_MARKET_ABI,
    functionName: "positionCount",
  });

  const positionIds = useMemo(() => {
    if (!positionCount) return [];
    const count = Number(positionCount);
    return Array.from({ length: Math.min(count, 200) }, (_, i) => BigInt(i + 1));
  }, [positionCount]);

  const positionCalls = useMemo(() => {
    if (!marketAddress || positionIds.length === 0) return [];
    return positionIds.map((id) => ({
      address: marketAddress,
      abi: ECHO_MARKET_ABI,
      functionName: "positions" as const,
      args: [id],
    }));
  }, [marketAddress, positionIds]);

  const { data: positionsResult } = useReadContracts({
    contracts: positionCalls,
    query: { enabled: positionCalls.length > 0 },
  });

  const userPositions = useMemo(() => {
    if (!positionsResult || !user) return [];
    return positionsResult
      .map((r, i) => {
        if (r.status !== "success" || !r.result) return null;
        const [posType, amount, entryPrice, openedAt, claimed] = r.result as [number, bigint, bigint, bigint, boolean];
        return {
          id: i + 1,
          posType,
          amount,
          entryPrice,
          openedAt: Number(openedAt) * 1000,
          claimed,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null && !p.claimed);
  }, [positionsResult, user]);

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: user ? [user, marketAddress] : undefined,
    query: { enabled: !!user },
  });

  const { writeContract: approveUsdc, data: approveHash } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: openPosition, data: openHash } = useWriteContract();
  const { isLoading: openLoading } = useWaitForTransactionReceipt({ hash: openHash });

  const { writeContract: closePosition, data: closeHash } = useWriteContract();
  const { isLoading: closeLoading } = useWaitForTransactionReceipt({ hash: closeHash });

  // Invalidate queries after transactions confirm so UI auto-refreshes
  useEffect(() => {
    if (approveSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      showToast("USDC approved", "success");
    }
  }, [approveSuccess, queryClient]);

  const needsApproval = !!user && !!allowance && parseUnits(amount || "0", 6) > allowance;

  useEffect(() => {
    if (!openLoading && openHash) {
      queryClient.invalidateQueries({ queryKey: ["readContract", "readContracts"] });
      showToast("Position opened — refreshing", "success");
      setAmount("");
    }
  }, [openLoading, openHash, queryClient]);

  useEffect(() => {
    if (!closeLoading && closeHash) {
      queryClient.invalidateQueries({ queryKey: ["readContract", "readContracts"] });
      showToast("Position closed — refreshing", "success");
    }
  }, [closeLoading, closeHash, queryClient]);

  const handleOpen = () => {
    if (!amount || !marketAddress) return;
    const value = parseUnits(amount, 6);
    if (needsApproval) {
      approveUsdc({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [marketAddress, value],
      }, {
        onSuccess: () => showToast("Approve transaction sent", "info"),
        onError: (err: any) => showToast(err?.shortMessage || err?.message || "Approval failed", "error"),
      });
    } else {
      openPosition({
        address: marketAddress,
        abi: ECHO_MARKET_ABI,
        functionName: "openPosition",
        args: [posType, value],
        gas: 500000n,
      }, {
        onSuccess: () => showToast("Position opened", "success"),
        onError: (err: any) => showToast(err?.shortMessage || err?.message || "Open position failed", "error"),
      });
    }
  };

  const handleClose = (positionId: number) => {
    closePosition({
      address: marketAddress,
      abi: ECHO_MARKET_ABI,
      functionName: "closePosition",
      args: [BigInt(positionId)],
      gas: 500000n,
    }, {
      onSuccess: () => showToast("Close position submitted", "success"),
      onError: (err: any) => showToast(err?.shortMessage || err?.message || "Close failed", "error"),
    });
  };

  const expiry = openingTime && windowDuration
    ? new Date((Number(openingTime) + Number(windowDuration)) * 1000)
    : null;

  const score = riskScore ? Number(riskScore) / 1e18 : 0;
  const short = totalShort ? formatUnits(totalShort, 6) : "0";
  const long = totalLong ? formatUnits(totalLong, 6) : "0";
  const total = Number(short) + Number(long);

  const shortPct = total > 0 ? (Number(short) / total) * 100 : 0;
  const longPct = total > 0 ? (Number(long) / total) * 100 : 0;

  const earlyExitPct = earlyExitBps ? Number(earlyExitBps) / 100 : 0;
  const protocolFeePct = protocolFeeBps ? Number(protocolFeeBps) / 100 : 2.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
                {marketName || address?.slice(0, 14) + "..."}
              </h1>
              {marketSymbol && (
                <p className="text-[10px] font-bold tracking-wider mt-0.5" style={{ color: "var(--accent)" }}>
                  {String(marketSymbol).toUpperCase()}
                </p>
              )}
              <p className="text-xs font-data mt-1 truncate" style={{ color: "var(--text-tertiary)" }}>
                {address}
              </p>
            </div>
            <RiskGauge score={score} />
          </div>

          {marketDescription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-5 p-3 text-xs leading-relaxed markdown-body overflow-x-auto"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(String(marketDescription)) }}
            />
          )}

          {marketProtocol && marketProtocol !== "0x0000000000000000000000000000000000000000" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-5 flex items-center gap-2"
            >
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                PROTOCOL
              </span>
              <span className="text-xs font-data" style={{ color: "var(--text-secondary)" }}>
                {String(marketProtocol).slice(0, 10)}...{String(marketProtocol).slice(-6)}
              </span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4"
              style={{ background: "var(--bg)" }}
            >
              <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                TOTAL SHORT
              </div>
              <div className="text-lg font-data font-bold" style={{ color: "var(--negative)" }}>
                ${Number(short).toFixed(2)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4"
              style={{ background: "var(--bg)" }}
            >
              <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                TOTAL LONG
              </div>
              <div className="text-lg font-data font-bold" style={{ color: "var(--positive)" }}>
                ${Number(long).toFixed(2)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4"
              style={{ background: "var(--bg)" }}
            >
              <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                STATUS
              </div>
              <div className="text-lg font-data font-bold" style={{ color: "var(--text-primary)" }}>
                {status !== undefined ? ["OPEN", "EXPIRED", "EXPLOITED"][status] : "..."}
              </div>
            </motion.div>
          </div>

          {expiry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                WINDOW EXPIRES
              </span>
              <span className="text-sm font-data" style={{ color: "var(--accent)" }}>
                {expiry.toISOString().replace("T", " ").slice(0, 19)} UTC
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-xs font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
              POSITION BOOK
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: "var(--border)" }}>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--negative)" }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: "var(--negative)" }}>
                  SHORTS {shortPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-px overflow-hidden mb-2" style={{ background: "var(--border)" }}>
                <motion.div
                  className="h-full"
                  style={{ background: "var(--negative)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${shortPct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-xs font-data" style={{ color: "var(--text-tertiary)" }}>
                {Number(short).toFixed(2)} USDC at risk
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--positive)" }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: "var(--positive)" }}>
                  LONGS {longPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-px overflow-hidden mb-2" style={{ background: "var(--border)" }}>
                <motion.div
                  className="h-full"
                  style={{ background: "var(--positive)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${longPct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-xs font-data" style={{ color: "var(--text-tertiary)" }}>
                {Number(long).toFixed(2)} USDC insured
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Positions */}
        {user && userPositions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-xs font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
                YOUR POSITIONS
              </h2>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                Early exit fee: {earlyExitPct}%
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {userPositions.map((pos) => (
                <div
                  key={pos.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="text-[10px] font-bold tracking-wider px-2 py-0.5"
                      style={{
                        background: pos.posType === 0 ? "var(--negative)" : "var(--positive)",
                        color: "var(--bg)",
                      }}
                    >
                      {pos.posType === 0 ? "SHORT" : "LONG"}
                    </span>
                    <div>
                      <div className="text-sm font-data font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatUnits(pos.amount, 6)} USDC
                      </div>
                      <div className="text-[10px] font-data" style={{ color: "var(--text-tertiary)" }}>
                        ID #{pos.id} · Entry {Number(pos.entryPrice) / 1e18 > 0 ? (Number(pos.entryPrice) / 1e18).toFixed(2) : "0.00"}
                      </div>
                    </div>
                  </div>
                  {status === 0 && (
                    <button
                      onClick={() => handleClose(pos.id)}
                      disabled={closeLoading}
                      className="px-3 py-1.5 text-[10px] font-bold tracking-widest transition-all duration-200 disabled:opacity-30"
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!closeLoading) {
                          e.currentTarget.style.borderColor = "var(--negative)";
                          e.currentTarget.style.color = "var(--negative)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      CLOSE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 h-fit"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--text-primary)" }}>
          OPEN POSITION
        </h2>
        <div className="grid grid-cols-2 gap-px mb-4" style={{ background: "var(--border)" }}>
          <button
            onClick={() => setPosType(0)}
            className="py-2.5 text-xs font-bold tracking-wider transition-colors"
            style={{
              background: posType === 0 ? "var(--negative)" : "var(--bg)",
              color: posType === 0 ? "var(--bg)" : "var(--text-secondary)",
            }}
          >
            SHORT
          </button>
          <button
            onClick={() => setPosType(1)}
            className="py-2.5 text-xs font-bold tracking-wider transition-colors"
            style={{
              background: posType === 1 ? "var(--positive)" : "var(--bg)",
              color: posType === 1 ? "var(--bg)" : "var(--text-secondary)",
            }}
          >
            LONG
          </button>
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: "var(--text-tertiary)" }}>
            USDC AMOUNT
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 text-sm font-data outline-none transition-colors"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            placeholder="0.00"
          />
        </div>
        {amount && Number(amount) > 0 && (
          <div className="mb-3 text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            Protocol fee: {protocolFeePct}% · Net stake: {(Number(amount) * (1 - protocolFeePct / 100)).toFixed(2)} USDC
          </div>
        )}
        <button
          onClick={handleOpen}
          disabled={openLoading || !user}
          className="w-full py-2.5 text-xs font-bold tracking-widest transition-all duration-200 disabled:opacity-30"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
          onMouseEnter={(e) => { if (!openLoading && user) e.currentTarget.style.filter = "brightness(1.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
        >
          {openLoading ? "CONFIRMING..." : needsApproval ? "APPROVE USDC" : "OPEN POSITION"}
        </button>
        {!user && (
          <p className="text-[10px] font-medium mt-3 text-center" style={{ color: "var(--text-tertiary)" }}>
            CONNECT WALLET TO TRADE
          </p>
        )}
      </motion.div>
    </div>
  );
}
