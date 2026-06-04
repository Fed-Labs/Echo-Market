import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMarkets } from "../hooks/useMarkets";
import { cidToBytes32, usdcToUnits, isAddress } from "../utils/encode";
import { storeSubmission } from "../utils/api";
import { showToast } from "../components/Toast";

const ARBITRATION_ADDRESS = import.meta.env.VITE_ARBITRATION_ADDRESS as `0x${string}`;

export function Submit() {
  const { isConnected } = useAccount();
  const { markets } = useMarkets();

  const [market, setMarket] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [calldata, setCalldata] = useState("");
  const [stake, setStake] = useState("");
  const [error, setError] = useState("");
  const [storing, setStoring] = useState(false);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async () => {
    setError("");

    if (!isConnected) {
      setError("Connect wallet first");
      return;
    }
    if (!isAddress(market)) {
      setError("Select a valid market");
      return;
    }
    if (!bugDescription.trim() || bugDescription.length < 20) {
      setError("Enter a detailed bug description (min 20 chars)");
      return;
    }
    if (!stake || Number(stake) <= 0) {
      setError("Enter a valid stake amount");
      return;
    }

    const ipfsHash = cidToBytes32(bugDescription.trim());
    const stakeUnits = usdcToUnits(stake);
    const payload = calldata.trim() || "0x";

    setStoring(true);
    try {
      await storeSubmission(ipfsHash, bugDescription.trim());
    } catch (err) {
      console.warn("[Submit] Backend store failed, continuing with on-chain submission", err);
    }
    setStoring(false);

    writeContract({
      address: ARBITRATION_ADDRESS,
      abi: [
        {
          inputs: [
            { internalType: "address", name: "market", type: "address" },
            { internalType: "bytes32", name: "ipfsCID", type: "bytes32" },
            { internalType: "bytes", name: "calldataPayload", type: "bytes" },
            { internalType: "uint256", name: "stakeAmount", type: "uint256" },
          ],
          name: "submitExploit",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "submitExploit",
      args: [market, ipfsHash, payload as `0x${string}`, stakeUnits],
    });
    showToast("Submitting exploit PoC...", "info");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-2xl font-black tracking-tighter mb-1" style={{ color: "var(--text-primary)" }}>
          Submit Exploit PoC
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Valid submissions require a reproducible PoC. False claims are slashed 50%.
        </p>

        {!isConnected && (
          <div className="mb-6 p-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              CONNECT WALLET TO SUBMIT
            </p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: "var(--text-tertiary)" }}>
              TARGET MARKET
            </label>
            {markets.length > 0 ? (
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="" style={{ background: "var(--bg)" }}>Select market</option>
                {markets.map((m) => (
                  <option key={m.address} value={m.address} style={{ background: "var(--bg)" }}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-data outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="0x..."
              />
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: "var(--text-tertiary)" }}>
              BUG DESCRIPTION &amp; PoC
            </label>
            <textarea
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full px-3 py-2.5 text-sm outline-none min-h-[120px] resize-y"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="Describe the vulnerability, reproduction steps, impacted contracts, and suggested fix..."
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              This is hashed and stored automatically — no manual IPFS upload needed.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: "var(--text-tertiary)" }}>
              EXPLOIT CALLDATA (OPTIONAL)
            </label>
            <textarea
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-data outline-none h-20"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="0x..."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: "var(--text-tertiary)" }}>
              STAKE (USDC)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-data outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="1000"
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              Minimum stake enforced by the market. False submissions forfeit 50%.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3"
              style={{ background: "rgba(255, 59, 92, 0.08)", border: "1px solid rgba(255, 59, 92, 0.2)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--negative)" }}>
                {error}
              </p>
            </motion.div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold tracking-widest transition-all duration-200 disabled:opacity-30"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.filter = "brightness(1.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
          >
            {storing ? "STORING..." : isLoading ? "SUBMITTING..." : isSuccess ? "SUBMITTED ✓" : "SIGN & SUBMIT →"}
          </button>

          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3"
              style={{ background: "rgba(0, 212, 170, 0.08)", border: "1px solid rgba(0, 212, 170, 0.2)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--positive)" }}>
                Exploit submitted. 48h dispute window active.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[10px] font-bold tracking-widest mb-4" style={{ color: "var(--text-tertiary)" }}>
          ARBITRATION FLOW
        </h2>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 font-bold tracking-wider" style={{ color: "var(--accent)", border: "1px solid var(--accent)", opacity: 0.7 }}>
            SUBMITTED
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>→</span>
          <span className="px-2.5 py-1 font-bold tracking-wider" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            UNDER REVIEW (48H)
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>→</span>
          <span className="px-2.5 py-1 font-bold tracking-wider" style={{ color: "var(--positive)", border: "1px solid var(--positive)", opacity: 0.7 }}>
            CONFIRMED
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>/</span>
          <span className="px-2.5 py-1 font-bold tracking-wider" style={{ color: "var(--negative)", border: "1px solid var(--negative)", opacity: 0.7 }}>
            REJECTED
          </span>
        </div>
      </motion.div>
    </div>
  );
}
