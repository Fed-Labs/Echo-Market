import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

/* ── Inline Code Block Component ─────────────────────────────────── */

function CodeBlock({ children, lang = "solidity" }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-4">
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[10px] font-data uppercase tracking-wider"
        style={{ background: "#0a0a10", borderBottom: "1px solid var(--border)" }}
      >
        <span style={{ color: "var(--text-tertiary)" }}>{lang}</span>
        <button
          onClick={copy}
          className="px-2 py-0.5 text-[10px] font-bold tracking-wider transition-all"
          style={{
            background: copied ? "var(--positive)" : "var(--surface-raised)",
            color: copied ? "var(--bg)" : "var(--text-secondary)",
          }}
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre
        className="overflow-x-auto p-4 text-xs font-data leading-relaxed"
        style={{
          background: "#0a0a10",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
          borderTop: "none",
        }}
      >
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

/* ── Tabbed Code Example ─────────────────────────────────────────── */

function CodeTabs({
  tabs,
}: {
  tabs: { label: string; lang: string; code: string }[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="my-4">
      <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border)" }}>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className="px-3 py-1.5 text-[10px] font-bold tracking-wider transition-colors"
            style={{
              background: active === i ? "#0a0a10" : "transparent",
              color: active === i ? "var(--accent)" : "var(--text-tertiary)",
              borderBottom: active === i ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock lang={tabs[active].lang}>{tabs[active].code}</CodeBlock>
    </div>
  );
}

/* ── Section Card ────────────────────────────────────────────────── */

function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * parseInt(num) }}
      className="p-6 scroll-mt-24"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="text-[10px] font-data font-bold px-1.5 py-0.5"
          style={{ color: "var(--accent)", border: "1px solid var(--accent-dim)" }}
        >
          {num}
        </span>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </motion.section>
  );
}

/* ── Inline Code ─────────────────────────────────────────────────── */

const Code = ({ children }: { children: React.ReactNode }) => (
  <code
    className="px-1 py-0.5 text-[11px] font-data rounded"
    style={{ background: "var(--surface-raised)", color: "var(--accent)" }}
  >
    {children}
  </code>
);

/* ── Main Docs Page ──────────────────────────────────────────────── */

export function Docs() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-2xl font-black tracking-tighter mb-1" style={{ color: "var(--text-primary)" }}>
          Documentation
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Architecture, integration guides, and contract references for developers and protocols.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div
            className="sticky top-20"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                CONTENTS
              </h2>
            </div>
            <nav className="p-1 max-h-[calc(100vh-10rem)] overflow-y-auto">
              {toc.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 text-xs font-medium transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                    e.currentTarget.style.background = "var(--surface-raised)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-tertiary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* ── 01 Overview ── */}
          <Section id="overview" num="01" title="What is Echo?">
            <p className="mb-4">
              Echo is the first on-chain oracle for exploit probability. Security researchers stake capital to price
              real-time smart contract risk through permissionless prediction markets. The output is a continuous,
              Chainlink-compatible risk feed that money markets, insurers and derivatives platforms consume natively.
            </p>
            <div
              className="p-4 my-4 font-data text-xs leading-relaxed"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <div style={{ color: "var(--text-tertiary)" }}>// Core mechanism in one line</div>
              <div style={{ color: "var(--text-secondary)" }}>
                SHORT = researcher bets on exploit → claims long pool if right
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                LONG = staker bets on safety → claims short pool if window expires clean
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                RATIO = real-time risk score (0-100) exposed as oracle feed
              </div>
            </div>
          </Section>

          {/* ── 02 Architecture ── */}
          <Section id="architecture" num="02" title="Architecture">
            <p className="mb-4">Six contracts. One protocol. Fully permissionless.</p>
            <div
              className="p-4 my-4 font-data text-[11px] leading-relaxed overflow-x-auto"
              style={{ background: "#0a0a10", border: "1px solid var(--border)" }}
            >
              <pre style={{ color: "var(--text-secondary)" }}>
{`┌─────────────────────────────────────────────────────────────────────────┐
│                         ECHO PROTOCOL                                    │
├─────────────┬──────────────┬───────────────┬────────────────────────────┤
│ ECHO.sol    │ EchoOracle   │ EchoArbitration│ EchoInsurancePool         │
│ Governance  │ Risk Oracle  │ PoC + Vote     │ Payout + Claim            │
│ Token       │ (AggregatorV3│ (3/5 Multisig) │ (Merkle Proofs)           │
│             │ Interface)   │                │                            │
└──────┬──────┴──────┬───────┴───────┬───────┴──────────────┬─────────────┘
       │             │               │                      │
       ▼             ▼               ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EchoFactory.sol                                  │
│                  Permissionless market factory                           │
├─────────────────────────────────────────────────────────────────────────┤
│                         EchoMarket.sol                                   │
│               Per-protocol prediction market                             │
│                                                                          │
│   ┌─────────────┐   ┌──────────────┐   ┌──────────────────────────┐    │
│   │  Positions  │   │   Exploit    │   │      Risk Score          │    │
│   │ Short/Long  │──▶│  Submission  │──▶│  0-100 (1h TWAP)         │    │
│   │ USDC stakes │   │  PoC + stake │   │  Chainlink-compatible    │    │
│   └─────────────┘   └──────────────┘   └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {[
                { name: "ECHO", desc: "Governance token. 1B supply. 40% community, 25% team, 20% investors, 15% treasury." },
                { name: "EchoFactory", desc: "Permissionless factory. Deploys EchoMarket instances. Enforces min liquidity for oracle activation." },
                { name: "EchoMarket", desc: "Per-protocol prediction market. Short/Long positions. Zero-sum pool. 1h TWAP risk updates." },
                { name: "EchoOracle", desc: "Aggregates short/long into 0-100 score. Implements AggregatorV3Interface. 24-observation ring buffer." },
                { name: "EchoArbitration", desc: "48h dispute window. 3/5 guardian multisig. 50% slash for false PoCs. Confirmed exploits trigger payout." },
                { name: "EchoInsurancePool", desc: "Merkle-proof registration. Pro-rata payouts on exploit confirmation. Protocol depositors claim coverage." },
              ].map((c) => (
                <div
                  key={c.name}
                  className="p-3"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <div className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>
                    {c.name}
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 03 Core Concepts ── */}
          <Section id="markets" num="03" title="Prediction Markets">
            <p className="mb-4">
              Each market represents a single protocol address over a fixed time window. Markets are fully
              permissionless — anyone can create one via <Code>EchoFactory.createMarket()</Code>.
            </p>
            <table className="w-full text-xs my-4" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left py-2 pr-4 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Parameter
                  </th>
                  <th className="text-left py-2 pr-4 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Type
                  </th>
                  <th className="text-left py-2 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["protocol", "address", "The smart contract being insured"],
                  ["windowDuration", "uint256", "Seconds until expiry (e.g. 2592000 = 30 days)"],
                  ["minStake", "uint256", "Minimum USDC per position (6 decimals)"],
                  ["maxStake", "uint256", "Maximum USDC per position"],
                  ["insuranceBps", "uint256", "Basis points of long pool to insurance on exploit (0-10000)"],
                ].map(([p, t, d]) => (
                  <tr key={p} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 pr-4 font-data" style={{ color: "var(--accent)" }}>
                      {p}
                    </td>
                    <td className="py-2 pr-4 font-data" style={{ color: "var(--text-secondary)" }}>
                      {t}
                    </td>
                    <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                      {d}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4">
              <strong style={{ color: "var(--text-primary)" }}>SHORT</strong> — Researcher stakes USDC betting an exploit
              will occur within the window. Must submit a valid PoC to claim the pool.
            </p>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>LONG</strong> — Staker believes the contract is safe. Earns
              yield from the short pool if the window closes clean.
            </p>
          </Section>

          <Section id="oracle" num="04" title="Risk Oracle">
            <p className="mb-4">
              The EchoOracle contract implements <Code>AggregatorV3Interface</Code> for composability. Each protocol
              address has a dedicated risk score feed computed from the short/long ratio.
            </p>
            <div className="grid grid-cols-3 gap-3 my-4">
              {[
                { label: "Decimals", value: "8" },
                { label: "Range", value: "0-100" },
                { label: "TWAP Window", value: "1 hour" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-3 text-center"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    {s.label}
                  </div>
                  <div className="text-sm font-data font-bold" style={{ color: "var(--text-primary)" }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
            <p className="mb-2">Risk score interpretation:</p>
            <div className="space-y-2">
              {[
                { range: "0-25", label: "LOW", color: "var(--positive)", desc: "Minimal concern. Standard collateral ratios apply." },
                { range: "26-50", label: "MODERATE", color: "#f5a623", desc: "Elevated attention. Consider reducing LTV or increasing margins." },
                { range: "51-75", label: "HIGH", color: "var(--accent)", desc: "Significant risk. Reduce exposure, pause deposits, or demand additional collateral." },
                { range: "76-100", label: "CRITICAL", color: "var(--negative)", desc: "Immediate action required. Halt operations or trigger circuit breakers." },
              ].map((r) => (
                <div
                  key={r.range}
                  className="flex items-center gap-3 p-3"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="px-2 py-0.5 text-[10px] font-data font-bold"
                    style={{ background: r.color + "22", color: r.color, border: `1px solid ${r.color}44` }}
                  >
                    {r.range}
                  </div>
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: r.color, minWidth: 80 }}>
                    {r.label}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {r.desc}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="arbitration" num="05" title="Guardian Council">
            <p className="mb-4">
              Each market has its own guardian set chosen by the protocol creator. No global council. No bottleneck.
            </p>
            <table className="w-full text-xs my-4" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left py-2 pr-4 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Parameter
                  </th>
                  <th className="text-left py-2 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Council Size", "3-5 guardians per market"],
                  ["Quorum", "Configurable (must be > 50%)"],
                  ["Dispute Window", "48 hours"],
                  ["False PoC Slash", "50% of stake"],
                  ["Slash Destination", "Insurance pool"],
                  ["No Quorum Default", "Rejected"],
                  ["Selection", "Chosen by market creator"],
                ].map(([p, v]) => (
                  <tr key={p} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 pr-4" style={{ color: "var(--text-secondary)" }}>
                      {p}
                    </td>
                    <td className="py-2 font-data" style={{ color: "var(--text-primary)" }}>
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 mt-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: "var(--accent)" }}>
                WHY PER-MARKET?
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                A global council of 5 people cannot scale to review exploits across 100+ protocols. Per-market guardians
                let each protocol choose reviewers they trust — bridge experts for bridge protocols, DeFi specialists for
                AMMs. The deployer (Head Researcher) can include themselves in every council they create.
              </div>
            </div>
          </Section>

          <Section id="insurance" num="06" title="Insurance Pool">
            <p className="mb-4">
              Long stakers implicitly provide insurance capital. When an exploit is confirmed, the insurance pool
              distributes pro-rata USDC payouts to affected users via Merkle proofs.
            </p>
            <p className="mb-2">Protocol operators register depositors in three steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <li>Take a snapshot of all depositor balances at market open</li>
              <li>Build a Merkle tree of <Code>(user, depositAmount)</Code> leaves</li>
              <li>Submit the Merkle root to <Code>EchoInsurancePool.registerMarket()</Code></li>
            </ol>
            <p className="mt-4">
              Depositors claim by providing a Merkle proof of their balance. Payouts are pro-rata based on the total
              insurance pool distributed on exploit confirmation.
            </p>
          </Section>

          {/* ── 07 Integration ── */}
          <Section id="integration" num="07" title="Integration Guide">
            <p className="mb-4">
              Consume the Echo Risk Feed in your protocol to dynamically adjust collateral ratios, pause functions, or
              trigger circuit breakers.
            </p>

            <h3 className="text-xs font-bold tracking-wider mb-2 mt-6" style={{ color: "var(--text-primary)" }}>
              Query Risk Score
            </h3>
            <CodeTabs
              tabs={[
                {
                  label: "Solidity",
                  lang: "solidity",
                  code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEchoOracle {
    function latestRoundData(address protocol)
        external view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract LendingProtocol {
    IEchoOracle public constant ECHO_ORACLE =
        IEchoOracle(0xYourOracleAddress);

    function getRiskScore(address collateral) external view returns (uint256) {
        (, int256 answer, , , ) = ECHO_ORACLE.latestRoundData(collateral);
        return uint256(answer) / 1e8; // 0-100
    }

    function adjustLTV(address collateral) external view returns (uint256) {
        uint256 risk = getRiskScore(collateral);

        if (risk > 75) return 50e16;  // 50% LTV — critical
        if (risk > 50) return 65e16;  // 65% LTV — high
        if (risk > 25) return 75e16;  // 75% LTV — moderate
        return 80e16;                 // 80% LTV — low risk
    }
}`,
                },
                {
                  label: "Viem",
                  lang: "typescript",
                  code: `import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const oracleAbi = [
  {
    inputs: [{ name: "protocol", type: "address" }],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const risk = await client.readContract({
  address: "0xYourOracleAddress",
  abi: oracleAbi,
  functionName: "latestRoundData",
  args: ["0xProtocolAddress"],
});

const riskPercent = Number(risk[1]) / 1e8;
console.log(\`Risk: \${riskPercent}%\`);`,
                },
                {
                  label: "Ethers v6",
                  lang: "typescript",
                  code: `import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/YOUR_KEY");

const oracleAbi = [
  "function latestRoundData(address protocol) view returns (uint80,int256,uint256,uint256,uint80)",
];

const oracle = new ethers.Contract("0xYourOracleAddress", oracleAbi, provider);

const [roundId, answer] = await oracle.latestRoundData("0xProtocolAddress");
const riskPercent = Number(answer) / 1e8;

console.log(\`Round: \${roundId}, Risk: \${riskPercent}%\`);`,
                },
              ]}
            />


          </Section>

          {/* ── 08 API Reference ── */}
          <Section id="api" num="08" title="REST API Reference">
            <p className="mb-4">
              The Echo backend exposes a REST API and WebSocket feed for market data, risk scores, and arbitration
              status. Base URL: <Code>https://api.echo-protocol.xyz</Code> (or your self-hosted instance).
            </p>
            <table className="w-full text-xs my-4" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left py-2 pr-4 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Method
                  </th>
                  <th className="text-left py-2 pr-4 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Endpoint
                  </th>
                  <th className="text-left py-2 font-data" style={{ color: "var(--text-tertiary)" }}>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["GET", "/health", "Health check"],
                  ["GET", "/markets", "All markets + latest risk scores"],
                  ["GET", "/markets/:address", "Single market with positions and exploits"],
                  ["GET", "/oracle/:address", "Risk score history for a protocol"],
                  ["GET", "/oracle/:address/feed", "Chainlink-compatible feed format"],
                  ["POST", "/arbitration/submit", "Stage an exploit submission"],
                  ["GET", "/arbitration/submissions", "List all submissions"],
                  ["GET", "/arbitration/submissions/:id", "Single submission detail"],
                  ["GET", "/leaderboard", "Top researchers by verified finds and ROI"],
                ].map(([m, p, d]) => (
                  <tr key={p} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td
                      className="py-2 pr-4 font-data text-[10px] font-bold"
                      style={{ color: m === "GET" ? "var(--positive)" : "var(--accent)" }}
                    >
                      {m}
                    </td>
                    <td className="py-2 pr-4 font-data" style={{ color: "var(--text-primary)" }}>
                      {p}
                    </td>
                    <td className="py-2" style={{ color: "var(--text-secondary)" }}>
                      {d}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
              WebSocket feed available at <Code>wss://api.echo-protocol.xyz</Code> for real-time market updates.
            </p>
          </Section>

          {/* ── 09 Contract Addresses ── */}
          <Section id="contracts" num="09" title="Contract Addresses">
            <p className="mb-4">All contracts are verified on Basescan. Source available in the /contracts directory.</p>

            <h3 className="text-xs font-bold tracking-wider mb-2 mt-4" style={{ color: "var(--text-primary)" }}>
              Base Sepolia Testnet
            </h3>
            <div className="space-y-1">
              {[
                ["ECHO Token", "0x114a00a15b5efaC31A1E84c4a86dbda6E448751c"],
                ["EchoFactory", "0x661B14C7F564F0DAC4Df00269299F4635654bc0e"],
                ["EchoOracle", "0x712d89643d18d1425807383dd8cDecF65f5F2988"],
                ["EchoArbitration", "0xF7908319eF6A763Ba58CC27402465c7944189F9b"],
                ["EchoInsurancePool", "0x6196C98c4E6DbcfcCb1636c068DA5528171B8557"],
                ["EchoTreasury", "0x3Fb8E2AbCa7603c6195735eb1F76a2b70Fb4B04c"],
                ["USDC (Mock)", "0x325459BB2D92C8554a620B1a55e42186a11d7173"],
              ].map(([name, addr]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {name}
                  </span>
                  <span className="text-xs font-data" style={{ color: "var(--text-tertiary)" }}>
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-bold tracking-wider mb-2 mt-6" style={{ color: "var(--text-primary)" }}>
              Base Mainnet
            </h3>
            <div className="space-y-1">
              {[
                ["ECHO Token", "TBD"],
                ["EchoFactory", "TBD"],
                ["EchoOracle", "TBD"],
                ["EchoArbitration", "TBD"],
                ["EchoInsurancePool", "TBD"],
                ["USDC", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
              ].map(([name, addr]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {name}
                  </span>
                  <span className="text-xs font-data" style={{ color: "var(--text-tertiary)" }}>
                    {addr}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-8 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-lg font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
              Ready to integrate?
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Consume live exploit risk data in your protocol. Oracle-ready in minutes.
            </p>
            <NavLink
              to="/app"
              className="px-6 py-2.5 text-xs font-bold tracking-widest inline-block transition-all"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              EXPLORE MARKETS
            </NavLink>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── Table of Contents ───────────────────────────────────────────── */

const toc = [
  { id: "overview", title: "What is Echo?" },
  { id: "architecture", title: "Architecture" },
  { id: "markets", title: "Prediction Markets" },
  { id: "oracle", title: "Risk Oracle" },
  { id: "arbitration", title: "Guardian Council" },
  { id: "insurance", title: "Insurance Pool" },
  { id: "integration", title: "Integration Guide" },
  { id: "api", title: "REST API Reference" },
  { id: "contracts", title: "Contract Addresses" },
];
