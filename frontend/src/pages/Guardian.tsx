import { useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { useMarkets } from "../hooks/useMarkets";
import { fetchSubmission } from "../utils/api";
import { renderMarkdown } from "../utils/markdown";
import { showToast } from "../components/Toast";

const ARBITRATION_ADDRESS = import.meta.env.VITE_ARBITRATION_ADDRESS as `0x${string}`;
const DISPUTE_WINDOW = 48 * 60 * 60 * 1000;

const ARBITRATION_ABI = [
  { inputs: [], name: "submissionCount", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "submissions", outputs: [{ internalType: "address", name: "researcher", type: "address" }, { internalType: "address", name: "market", type: "address" }, { internalType: "bytes32", name: "ipfsCID", type: "bytes32" }, { internalType: "bytes", name: "calldataPayload", type: "bytes" }, { internalType: "uint256", name: "submittedAt", type: "uint256" }, { internalType: "uint8", name: "status", type: "uint8" }, { internalType: "uint256", name: "slashAmount", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "hasVoted", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "confirmVotes", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "rejectVotes", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "submissionId", type: "uint256" }, { internalType: "bool", name: "confirm", type: "bool" }], name: "vote", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "submissionId", type: "uint256" }], name: "finalize", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

interface Submission {
  id: number;
  researcher: string;
  market: string;
  ipfsCID: string;
  calldataPayload: string;
  submittedAt: number;
  status: number;
  slashAmount: bigint;
  confirmVotes: number;
  rejectVotes: number;
  hasVoted: boolean;
}

export function Guardian() {
  const { address } = useAccount();
  const { markets } = useMarkets();
  const [selected, setSelected] = useState<number | null>(null);

  const marketNameMap = markets.reduce((acc, m) => {
    acc[m.address.toLowerCase()] = m.name;
    return acc;
  }, {} as Record<string, string>);

  const { data: count } = useReadContract({
    address: ARBITRATION_ADDRESS,
    abi: ARBITRATION_ABI,
    functionName: "submissionCount",
  });

  const ids = count ? Array.from({ length: Number(count) }, (_, i) => BigInt(i + 1)) : [];

  const { data: subsRaw } = useReadContracts({
    contracts: ids.flatMap((id) => [
      { address: ARBITRATION_ADDRESS, abi: ARBITRATION_ABI, functionName: "submissions", args: [id] },
      { address: ARBITRATION_ADDRESS, abi: ARBITRATION_ABI, functionName: "confirmVotes", args: [id] },
      { address: ARBITRATION_ADDRESS, abi: ARBITRATION_ABI, functionName: "rejectVotes", args: [id] },
      { address: ARBITRATION_ADDRESS, abi: ARBITRATION_ABI, functionName: "hasVoted", args: [id, address ?? "0x0"] },
    ]),
    query: { enabled: ids.length > 0 && !!address },
  });

  const submissions: Submission[] = [];
  if (subsRaw) {
    for (let i = 0; i < ids.length; i++) {
      const base = i * 4;
      const sub = subsRaw[base]?.result as any;
      if (!sub) continue;
      submissions.push({
        id: Number(ids[i]),
        researcher: sub[0],
        market: sub[1],
        ipfsCID: sub[2],
        calldataPayload: sub[3],
        submittedAt: Number(sub[4]),
        status: Number(sub[5]),
        slashAmount: sub[6],
        confirmVotes: Number(subsRaw[base + 1]?.result ?? 0),
        rejectVotes: Number(subsRaw[base + 2]?.result ?? 0),
        hasVoted: Boolean(subsRaw[base + 3]?.result ?? false),
      });
    }
  }

  const pending = submissions.filter((s) => s.status === 0);
  const resolved = submissions.filter((s) => s.status !== 0);
  const selectedSub = submissions.find((s) => s.id === selected);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-2xl font-black tracking-tighter mb-1" style={{ color: "var(--text-primary)" }}>
          Guardian Console
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          3/5 multisig arbitration. Review PoCs, inspect calldata, cast votes. False approvals slash your reputation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-[10px] font-bold tracking-widest" style={{ color: "var(--negative)" }}>
                PENDING ({pending.length})
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)", maxHeight: "500px", overflowY: "auto" }}>
              {pending.length === 0 && (
                <div className="px-4 py-5 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                  No pending submissions
                </div>
              )}
              {pending.map((s) => {
                const timeLeft = s.submittedAt * 1000 + DISPUTE_WINDOW - Date.now();
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className="w-full text-left px-4 py-3 transition-colors"
                    style={{
                      background: selected === s.id ? "var(--surface-raised)" : "transparent",
                      borderLeft: selected === s.id ? "2px solid var(--accent)" : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => { if (selected !== s.id) e.currentTarget.style.background = "var(--surface-raised)"; }}
                    onMouseLeave={(e) => { if (selected !== s.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-data font-bold" style={{ color: "var(--accent)" }}>
                        #{String(s.id).padStart(3, "0")}
                      </span>
                      <span className="text-[10px] font-data" style={{ color: "var(--text-tertiary)" }}>
                        {timeLeft > 0 ? `${Math.ceil(timeLeft / 3600000)}h left` : "EXPIRED"}
                      </span>
                    </div>
                    <div className="text-xs font-data truncate" style={{ color: "var(--text-secondary)" }}>
                      {marketNameMap[s.market.toLowerCase()] || s.market.slice(0, 10) + "..." + s.market.slice(-6)}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-data" style={{ color: "var(--positive)" }}>
                        ✓ {s.confirmVotes}/5
                      </span>
                      <span className="text-[10px] font-data" style={{ color: "var(--negative)" }}>
                        ✗ {s.rejectVotes}/5
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
                RESOLVED ({resolved.length})
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)", maxHeight: "300px", overflowY: "auto" }}>
              {resolved.map((s) => (
                <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-data" style={{ color: "var(--text-secondary)" }}>
                    #{String(s.id).padStart(3, "0")}
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-wider px-1.5 py-0.5"
                    style={{
                      color: s.status === 1 ? "var(--positive)" : "var(--text-tertiary)",
                      border: `1px solid ${s.status === 1 ? "var(--positive)" : "var(--border)"}`,
                      opacity: 0.7,
                    }}
                  >
                    {s.status === 1 ? "CONFIRMED" : "REJECTED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedSub ? (
              <SubmissionDetail key={selectedSub.id} sub={selectedSub} onClose={() => setSelected(null)} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center h-full p-12"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-4xl mb-3" style={{ color: "var(--text-tertiary)" }}>◈</div>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Select a submission to review
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SubmissionDetail({ sub, onClose }: { sub: Submission; onClose: () => void }) {
  const { address } = useAccount();
  const { markets } = useMarkets();
  const [ipfsData, setIpfsData] = useState<string | null>(null);

  const { writeContract: vote, data: voteHash } = useWriteContract();
  const { isLoading: voting } = useWaitForTransactionReceipt({ hash: voteHash });

  const { writeContract: finalize } = useWriteContract();

  const timeLeft = sub.submittedAt * 1000 + DISPUTE_WINDOW - Date.now();
  const expired = timeLeft <= 0;

  const marketName = markets.find((m) => m.address.toLowerCase() === sub.market.toLowerCase())?.name;

  const handleVote = (confirm: boolean) => {
    if (!address) return;
    vote({
      address: ARBITRATION_ADDRESS,
      abi: ARBITRATION_ABI,
      functionName: "vote",
      args: [BigInt(sub.id), confirm],
    });
    showToast(`Vote ${confirm ? "confirm" : "reject"} submitted`, "info");
  };

  const handleFinalize = () => {
    finalize({
      address: ARBITRATION_ADDRESS,
      abi: ARBITRATION_ABI,
      functionName: "finalize",
      args: [BigInt(sub.id)],
    });
    showToast("Finalizing submission...", "info");
  };

  const fetchContent = async () => {
    setIpfsData("Loading...");
    // Try backend first
    const backend = await fetchSubmission(sub.ipfsCID);
    if (backend) {
      setIpfsData(backend.content);
      return;
    }
    // Fallback to IPFS gateway
    try {
      const res = await fetch(`https://ipfs.io/ipfs/${sub.ipfsCID}`);
      const text = await res.text();
      setIpfsData(text);
    } catch {
      setIpfsData("Unable to fetch content. It may not have been stored yet.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      className="h-full"
    >
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-data font-bold" style={{ color: "var(--accent)" }}>
            #{String(sub.id).padStart(3, "0")}
          </span>
          {expired ? (
            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5" style={{ color: "var(--negative)", border: "1px solid var(--negative)", opacity: 0.7 }}>
              DISPUTE EXPIRED
            </span>
          ) : (
            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5" style={{ color: "var(--accent)", border: "1px solid var(--accent)", opacity: 0.7 }}>
              {Math.ceil(timeLeft / 3600000)}H REMAINING
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
          {[
            { label: "RESEARCHER", value: sub.researcher },
            { label: "TARGET MARKET", value: marketName || sub.market },
            { label: "STAKE", value: `${Number(sub.slashAmount) / 1e6} USDC` },
            { label: "VOTE TALLY", value: `✓ ${sub.confirmVotes}  ✗ ${sub.rejectVotes}` },
          ].map((row) => (
            <div key={row.label} className="p-3" style={{ background: "var(--bg)" }}>
              <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                {row.label}
              </div>
              <div className="text-xs font-data truncate" style={{ color: "var(--text-primary)" }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              BUG REPORT
            </label>
            <button
              onClick={fetchContent}
              className="text-[10px] font-bold tracking-wider transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {ipfsData ? "REFETCH" : "LOAD CONTENT"}
            </button>
          </div>
          <div
            className="p-3 text-xs min-h-[80px] markdown-body"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{
              __html: ipfsData ? renderMarkdown(ipfsData) : "Click Load Content to review the bug report.",
            }}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold tracking-widest block mb-2" style={{ color: "var(--text-tertiary)" }}>
            EXPLOIT CALLDATA
          </label>
          <div
            className="p-3 text-xs font-data break-all"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            {sub.calldataPayload}
          </div>
        </div>

        <div className="pt-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
          {sub.hasVoted ? (
            <div className="p-3" style={{ background: "var(--accent-dim)", border: "1px solid rgba(255,90,54,0.15)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                You have already voted on this submission.
              </p>
            </div>
          ) : expired ? (
            <button
              onClick={handleFinalize}
              className="w-full py-2.5 text-xs font-bold tracking-widest transition-all"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
            >
              FINALIZE SUBMISSION
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote(true)}
                disabled={voting}
                className="py-2.5 text-xs font-bold tracking-wider transition-colors disabled:opacity-30"
                style={{
                  background: "rgba(0, 212, 170, 0.08)",
                  border: "1px solid rgba(0, 212, 170, 0.2)",
                  color: "var(--positive)",
                }}
              >
                {voting ? "VOTING..." : "✓ CONFIRM"}
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={voting}
                className="py-2.5 text-xs font-bold tracking-wider transition-colors disabled:opacity-30"
                style={{
                  background: "rgba(255, 59, 92, 0.08)",
                  border: "1px solid rgba(255, 59, 92, 0.2)",
                  color: "var(--negative)",
                }}
              >
                {voting ? "VOTING..." : "✗ REJECT"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
