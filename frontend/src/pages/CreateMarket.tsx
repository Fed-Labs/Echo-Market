import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits, isAddress, formatUnits } from "viem";
import { ECHO_FACTORY_ABI, USDC_ABI } from "../utils/contracts";
import { showToast } from "../components/Toast";


const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS as `0x${string}`;
const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`;
const CREATION_FEE = parseUnits("200", 6);

const DURATIONS = [
  { label: "30 Days", value: 30 * 24 * 60 * 60 },
  { label: "60 Days", value: 60 * 24 * 60 * 60 },
  { label: "90 Days", value: 90 * 24 * 60 * 60 },
];

export function CreateMarket() {
  const { address: user, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [protocols, setProtocols] = useState<string[]>([""]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [symbol, setSymbol] = useState("ECHO-");
  const [windowDuration, setWindowDuration] = useState<number>(DURATIONS[0].value);
  const [minStake, setMinStake] = useState("100");
  const [maxStake, setMaxStake] = useState("10000");
  const [guardian1, setGuardian1] = useState("");
  const [guardian2, setGuardian2] = useState("");
  const [guardian3, setGuardian3] = useState("");
  const [guardianQuorum, setGuardianQuorum] = useState("3");

  const addProtocol = () => setProtocols([...protocols, ""]);
  const removeProtocol = (idx: number) => {
    if (protocols.length > 1) {
      setProtocols(protocols.filter((_, i) => i !== idx));
    }
  };
  const updateProtocol = (idx: number, value: string) => {
    const next = [...protocols];
    next[idx] = value;
    setProtocols(next);
  };

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: user ? [user, FACTORY_ADDRESS] : undefined,
    query: { enabled: !!user },
  });

  const feeApproved = allowance !== undefined && allowance >= CREATION_FEE;

  const { writeContract: approveUsdc, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: createMarket, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // After approval confirms, invalidate allowance so feeApproved updates without refresh
  useEffect(() => {
    if (approveSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      showToast("USDC approved — you can now deploy", "success");
    }
  }, [approveSuccess, queryClient]);

  // After market creation confirms, invalidate markets list
  useEffect(() => {
    if (!isConfirming && hash) {
      queryClient.invalidateQueries({ queryKey: ["readContract", "readContracts"] });
      showToast("Market created — refreshing", "success");
    }
  }, [isConfirming, hash, queryClient]);

  const validate = () => {
    const primaryProtocol = protocols[0];
    if (!primaryProtocol || !isAddress(primaryProtocol)) {
      showToast("At least one valid protocol address is required", "error");
      return false;
    }
    for (let i = 1; i < protocols.length; i++) {
      if (protocols[i] && !isAddress(protocols[i])) {
        showToast(`Invalid protocol address #${i + 1}`, "error");
        return false;
      }
    }
    if (!name.trim() || !symbol.trim() || symbol.length <= 5) {
      showToast("Name and symbol are required. Symbol must have a suffix after ECHO-", "error");
      return false;
    }
    if (!description.trim() || description.length < 20) {
      showToast("Description is required (min 20 chars). Include in-scope contracts, known vulns, etc.", "error");
      return false;
    }
    if (!isAddress(guardian1) || !isAddress(guardian2) || !isAddress(guardian3)) {
      showToast("All three guardian addresses must be valid", "error");
      return false;
    }
    const min = parseFloat(minStake);
    const max = parseFloat(maxStake);
    if (min <= 0 || max <= min) {
      showToast("Max stake must be greater than min stake", "error");
      return false;
    }
    // insuranceBps and earlyExitBps use sensible defaults (20% / 10%)
    const quorum = Number(guardianQuorum);
    if (quorum < 3 || quorum > 5) {
      showToast("Quorum must be between 3 and 5", "error");
      return false;
    }
    return true;
  };

  const handleApproveFee = () => {
    if (!isConnected || !user) {
      showToast("Connect wallet first", "error");
      return;
    }
    approveUsdc({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "approve",
      args: [FACTORY_ADDRESS, CREATION_FEE],
    }, {
      onSuccess: () => showToast("Approve 200 USDC fee — confirm in wallet", "info"),
      onError: (err: any) => showToast(err?.shortMessage || err?.message || "Approval failed", "error"),
    });
  };

  const handleSubmit = () => {
    if (!isConnected || !user) {
      showToast("Connect wallet first", "error");
      return;
    }
    if (!validate()) return;
    if (!feeApproved) {
      showToast("Approve 200 USDC creation fee first", "error");
      return;
    }

    const guardians = [guardian1, guardian2, guardian3] as [`0x${string}`, `0x${string}`, `0x${string}`];

    const allProtocols = protocols.filter((p) => p.trim());
    const descriptionWithProtocols = allProtocols.length > 1
      ? `In-scope contracts: ${allProtocols.join(", ")}\n\n${description.trim()}`
      : description.trim();

    createMarket(
      {
        address: FACTORY_ADDRESS,
        abi: ECHO_FACTORY_ABI,
        functionName: "createMarket",
        args: [
          {
            protocol: protocols[0] as `0x${string}`,
            windowDuration: BigInt(windowDuration),
            minStake: parseUnits(minStake, 6),
            maxStake: parseUnits(maxStake, 6),
            insuranceBps: 2000n,
            earlyExitBps: 1000n,
            name: name.trim(),
            symbol: symbol.trim(),
            description: descriptionWithProtocols,
            projectGuardians: guardians,
            guardianQuorum: BigInt(guardianQuorum),
          },
        ],
      },
      {
        onSuccess: () => showToast("Transaction submitted — creating market...", "success"),
        onError: (err: any) => showToast(err?.shortMessage || err?.message || "Transaction failed", "error"),
      }
    );
  };

  const inputBase =
    "w-full px-3 py-2 text-sm bg-transparent border outline-none transition-colors duration-200 font-mono";
  const inputStyle = {
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  } as React.CSSProperties;
  const labelStyle = {
    color: "var(--text-tertiary)",
  } as React.CSSProperties;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Create Market
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Permissionlessly deploy a new EchoMarket for any smart contract protocol.
          </p>
        </div>

        <div className="space-y-6">
          {/* Protocol Addresses */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
              PROTOCOL CONTRACT ADDRESSES
            </label>
            <p className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)" }}>
              Add all in-scope smart contract addresses for this protocol.
            </p>
            <div className="space-y-2">
              {protocols.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Protocol contract ${idx + 1} — 0x...`}
                    value={p}
                    onChange={(e) => updateProtocol(idx, e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                  {protocols.length > 1 && (
                    <button
                      onClick={() => removeProtocol(idx)}
                      className="px-2 py-2 text-xs font-bold"
                      style={{ color: "var(--negative)" }}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addProtocol}
              className="mt-2 px-3 py-1.5 text-[10px] font-bold tracking-widest transition-all"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              type="button"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              + ADD CONTRACT
            </button>
          </div>

          {/* Name + Symbol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
                MARKET NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Uniswap V3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
                SYMBOL
              </label>
              <input
                type="text"
                placeholder="e.g. ECHO-UNI"
                value={symbol}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("ECHO-")) setSymbol(val);
                  else setSymbol("ECHO-" + val.replace(/^ECHO-/, ""));
                }}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                Symbol identifies the market (like an ERC20 ticker). Always prefixed with ECHO-.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
              DESCRIPTION
            </label>
            <DescriptionEditor value={description} onChange={setDescription} />
          </div>

          {/* Window Duration */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
              WINDOW DURATION
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setWindowDuration(d.value)}
                  className="flex-1 px-3 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                  style={{
                    background: windowDuration === d.value ? "var(--accent)" : "var(--surface)",
                    color: windowDuration === d.value ? "var(--bg)" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min / Max Stake */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
                MIN STAKE (USDC)
              </label>
              <input
                type="number"
                value={minStake}
                onChange={(e) => setMinStake(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
                MAX STAKE (USDC)
              </label>
              <input
                type="number"
                value={maxStake}
                onChange={(e) => setMaxStake(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>
          </div>

          {/* Guardians */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
              PROJECT GUARDIANS
            </label>
            <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
              Provide 3 addresses. The factory will combine them with 2 Echo team guardians for a 5-person council.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Guardian 1 — 0x..."
                value={guardian1}
                onChange={(e) => setGuardian1(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <input
                type="text"
                placeholder="Guardian 2 — 0x..."
                value={guardian2}
                onChange={(e) => setGuardian2(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <input
                type="text"
                placeholder="Guardian 3 — 0x..."
                value={guardian3}
                onChange={(e) => setGuardian3(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>
          </div>

          {/* Quorum */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={labelStyle}>
              GUARDIAN QUORUM
            </label>
            <input
              type="number"
              min={3}
              max={5}
              value={guardianQuorum}
              onChange={(e) => setGuardianQuorum(e.target.value)}
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>

          {/* Fee notice */}
          <div className="pt-2">
            <p className="text-[10px] font-medium text-center" style={{ color: "var(--text-tertiary)" }}>
              Creation fee: {formatUnits(CREATION_FEE, 6)} USDC (40% Treasury, 60% Insurance Pool)
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4">
            {!feeApproved ? (
              <button
                onClick={handleApproveFee}
                disabled={isApproving || approveSuccess}
                className="w-full py-3 text-sm font-bold tracking-widest transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--accent)",
                }}
                onMouseEnter={(e) => {
                  if (!isApproving && !approveSuccess) e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                {isApproving ? "APPROVING FEE..." : approveSuccess ? "FEE APPROVED — DEPLOY BELOW" : "APPROVE 200 USDC FEE"}
              </button>
            ) : null}
            <button
              onClick={handleSubmit}
              disabled={isPending || isConfirming || !feeApproved}
              className="w-full py-3 text-sm font-bold tracking-widest transition-all duration-200 disabled:opacity-50 mt-2"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
              }}
              onMouseEnter={(e) => {
                if (!isPending && !isConfirming && feeApproved) e.currentTarget.style.filter = "brightness(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              {isPending ? "SUBMITTING..." : isConfirming ? "CONFIRMING..." : "DEPLOY MARKET"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DescriptionEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const apply = (wrap: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    let replacement = "";
    if (wrap === "link") {
      replacement = `[${selected || "link text"}](url)`;
    } else if (wrap === "heading") {
      replacement = `## ${selected || "Heading"}\n`;
    } else if (wrap === "list") {
      const lines = (selected || "item").split("\n");
      replacement = lines.map((l) => `- ${l}`).join("\n");
    } else {
      replacement = `${wrap}${selected || wrap}${wrap}`;
    }

    const next = before + replacement + after;
    onChange(next);
    setTimeout(() => {
      el.focus();
      const cursor = start + replacement.length;
      el.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const btn = "px-2 py-1 text-[10px] font-bold tracking-wider transition-colors";
  const btnStyle = { border: "1px solid var(--border)", color: "var(--text-secondary)" } as React.CSSProperties;

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <button type="button" className={btn} style={btnStyle} onClick={() => apply("**")} title="Bold">B</button>
        <button type="button" className={btn} style={btnStyle} onClick={() => apply("_")} title="Italic">I</button>
        <button type="button" className={btn} style={btnStyle} onClick={() => apply("heading")} title="Heading">H</button>
        <button type="button" className={btn} style={btnStyle} onClick={() => apply("link")} title="Link">🔗</button>
        <button type="button" className={btn} style={btnStyle} onClick={() => apply("list")} title="List">•</button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-transparent border outline-none transition-colors duration-200 font-mono min-h-[100px] resize-y"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        placeholder="Describe the protocol, in-scope contracts, known vulnerabilities, audit status, bug bounty rules..."
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      />
      <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
        {value.length}/1000 chars — Markdown supported.
      </p>
    </div>
  );
}
