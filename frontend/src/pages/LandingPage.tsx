import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useRef, useState, useEffect } from "react";
import { Constellation } from "../components/Constellation";
import { MagneticText } from "../components/MagneticText";
import { ScrambleText } from "../components/ScrambleText";
import { WarpJump } from "../components/WarpJump";

const FEATURES = [
  {
    num: "01",
    title: "Live Risk Oracle",
    desc: "Chainlink-compatible feeds pricing exploit probability in real time. Every lending protocol needs this data.",
  },
  {
    num: "02",
    title: "Permissionless Markets",
    desc: "Launch a prediction market for any smart contract. No permissions. No gatekeepers. Pure mechanism.",
  },
  {
    num: "03",
    title: "On-Chain Insurance",
    desc: "Long-staker capital auto-converts to pro-rata insurance payouts for registered depositors on exploit.",
  },
  {
    num: "04",
    title: "Guardian Arbitration",
    desc: "3/5 multisig council validates every PoC submission. 48h dispute window. False claims slashed 50%.",
  },
];

const STATS = [
  { label: "Active Markets", value: "24" },
  { label: "TVL at Risk", value: "$12.4M" },
  { label: "Verified Exploits", value: "7" },
  { label: "Researchers", value: "143" },
];

const PROTOCOLS = [
  { name: "Aave V3", risk: 13, short: 420000, long: 2800000 },
  { name: "Uniswap V4", risk: 45, short: 1800000, long: 2200000 },
  { name: "EigenLayer", risk: 72, short: 3400000, long: 1300000 },
  { name: "Lido", risk: 8, short: 120000, long: 1400000 },
  { name: "Curve", risk: 34, short: 890000, long: 1700000 },
  { name: "Compound", risk: 21, short: 310000, long: 1200000 },
];

const STEPS = [
  { title: "List", desc: "Any protocol lists its smart contracts. No approval. No whitelisting fee." },
  { title: "Stake", desc: "Researchers stake USDC to price exploit probability. Short bets on hack. Long bets on safety." },
  { title: "Resolve", desc: "48h guardian arbitration validates PoCs. Confirmed exploits trigger automatic payouts." },
  { title: "Consume", desc: "Money markets, insurers, and derivatives platforms query the live risk feed on-chain." },
];

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px z-[60] origin-left"
      style={{ scaleX, background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }}
    />
  );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const targetNum = parseFloat(value.replace(/[^0-9.]/g, ""));
          const isDecimal = value.includes(".");
          const duration = 2000;
          const startTime = performance.now();
          const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = targetNum * eased;
            setDisplay(isDecimal ? current.toFixed(1) : Math.floor(current).toString());
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="font-data font-bold">
      {prefix}{display}{suffix}
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setSpotlight({ x: 50, y: 50 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative"
      style={{ perspective: "1000px" }}
    >
      <div
        className="glass-panel p-8 h-full transition-all duration-300 relative overflow-hidden rounded-2xl"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out, box-shadow 0.3s ease-out",
          boxShadow: tilt.x !== 0 ? "0 20px 40px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,90,54,0.06), transparent 40%)`,
          }}
        />
        <span className="text-4xl font-black font-data block mb-4 relative z-10" style={{ color: "var(--text-tertiary)", lineHeight: 1 }}>
          {feature.num}
        </span>
        <h3 className="text-lg font-bold tracking-tight mb-3 relative z-10" style={{ color: "var(--text-primary)" }}>
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed relative z-10" style={{ color: "var(--text-secondary)" }}>
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}

function GradientText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-r from-[#FF5A36] via-[#FF8C69] to-[#FF5A36] animate-gradient-x ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "gradient-x 3s ease infinite",
      }}
    >
      {text}
    </span>
  );
}

const FLOATING_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 5,
  color: i % 3 === 0 ? "var(--accent)" : i % 3 === 1 ? "var(--positive)" : "var(--text-tertiary)",
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {FLOATING_PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full float-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.3,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Marquee() {
  const items = ["Aave", "Uniswap", "Curve", "Lido", "Compound", "EigenLayer", "Morpho", "Pendle", "Balancer", "Synthetix"];
  return (
    <div className="overflow-hidden py-6" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((name, i) => (
          <span key={i} className="mx-8 text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-tertiary)" }}>
            {name}
            <span className="ml-8" style={{ color: "var(--accent)", opacity: 0.5 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const { isConnected } = useAccount();
  const { login, ready } = usePrivy();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [warpActive, setWarpActive] = useState(false);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 300]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const el = e.currentTarget as HTMLElement;
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="relative">
      <ScrollProgress />

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        style={{ "--spotlight-x": "50%", "--spotlight-y": "50%" } as React.CSSProperties}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ opacity: 0.6 }}
        >
          <source src="/hero-crystal.webm" type="video/webm" />
          <source src="/hero-crystal.mp4" type="video/mp4" />
        </video>
        <FloatingParticles />

        {/* Animated spotlight following cursor */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] spotlight-cursor"
        />
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, var(--bg) 100%)" }}
        />

        {/* Dynamic blurred orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div
            className="absolute inset-0 rounded-full mix-blend-screen filter blur-[120px] orb-pulse"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          />
        </div>

        <motion.div
          style={{ 
            y: heroY, 
            opacity: heroOpacity, 
            scale: heroScale,
            background: "rgba(10, 10, 15, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
          }}
          className="glass-panel p-16 rounded-3xl relative z-10 text-center px-6 max-w-5xl mx-auto shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-widest mb-10"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "var(--accent)" }} />
            LIVE ON BASE SEPOLIA
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <MagneticText
              text="ECHO"
              className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85]"
              charClassName="font-black tracking-tighter"
              charStyle={{ color: "var(--text-primary)", lineHeight: 0.85 }}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-3xl font-bold tracking-tight mb-6"
          >
            <GradientText text="The Oracle for Exploit Probability" />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl leading-relaxed mb-12 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            $2.4B was lost to exploits in 2024. Zero real-time risk pricing existed.
            <br />
            <span style={{ color: "var(--accent)" }}>Price what everyone fears.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-4"
          >
            {!isConnected ? (
              <button
                onClick={() => { if (ready) login(); }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-[#FF5A36] opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-300 rounded" />
                <div className="relative px-8 py-3 text-xs font-bold tracking-widest bg-[#FF5A36] text-[#030305] transition-transform duration-300 group-hover:scale-[1.02] rounded-sm">
                  ENTER APP
                </div>
              </button>
            ) : (
              <button
                onClick={() => setWarpActive(true)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-[#FF5A36] opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-300 rounded" />
                <div className="relative px-8 py-3 text-xs font-bold tracking-widest bg-[#FF5A36] text-[#030305] transition-transform duration-300 group-hover:scale-[1.02] rounded-sm">
                  ENTER APP
                </div>
              </button>
            )}
            <Link
              to="/docs"
              className="glass-panel px-8 py-3 text-xs font-bold tracking-widest transition-all duration-300 inline-block rounded-sm hover:scale-[1.02] hover:text-white"
              style={{ color: "var(--text-secondary)" }}
            >
              DOCUMENTATION
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
            SCROLL
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8"
            style={{ background: "linear-gradient(to bottom, var(--accent), transparent)" }}
          />
        </motion.div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* How It Works */}
      <section className="relative py-32 px-6" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-20 text-center">
              <span className="text-xs font-bold tracking-widest block mb-4" style={{ color: "var(--accent)" }}>MECHANISM</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
                How It Works
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px" style={{ background: "linear-gradient(to right, var(--border), var(--accent), var(--border))" }} />




            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel p-8 text-center relative group rounded-xl"
              >
                <div className="absolute inset-0 bg-[#FF5A36] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
                <div
                  className="w-16 h-16 mx-auto mb-6 flex items-center justify-center relative z-10 rounded-full"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 0 20px rgba(255,90,54,0.15)",
                  }}
                >
                  <span className="text-xl font-black font-data" style={{ color: "var(--accent)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-3 relative z-10" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Risk Feed Preview */}
      <section className="relative py-32 px-6" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-16">
              <span className="text-xs font-bold tracking-widest block mb-4" style={{ color: "var(--accent)" }}>LIVE FEED</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
                Real-Time Risk<br />Signals
              </h2>
            </div>
          </FadeUp>

          <div className="flex flex-col gap-3">
            {PROTOCOLS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel flex items-center justify-between px-6 py-5 group cursor-pointer relative overflow-hidden rounded-xl border border-[var(--glass-border)] hover:border-[#FF5A36] transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-data font-bold w-6" style={{ color: "var(--text-tertiary)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)" }} />
                    <ScrambleText
                      text={p.name}
                      className="text-sm font-medium transition-colors group-hover:text-white"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5" style={{ background: "rgba(255,59,92,0.08)", color: "var(--negative)" }}>
                      S ${(p.short / 1e6).toFixed(1)}M
                    </span>
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5" style={{ background: "rgba(0,212,170,0.08)", color: "var(--positive)" }}>
                      L ${(p.long / 1e6).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-32 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)",
                        boxShadow: `0 0 10px ${p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)"}`,
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.risk}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span
                    className="text-sm font-data font-bold w-10 text-right"
                    style={{
                      color: p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)",
                    }}
                  >
                    {p.risk}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="mb-16">
              <span className="text-xs font-bold tracking-widest block mb-4" style={{ color: "var(--accent)" }}>CAPABILITIES</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
                What Echo Does
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.num} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "var(--bg)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,90,54,0.04), transparent)" }}
        />
        <div className="max-w-6xl mx-auto relative">
          <FadeUp>
            <div className="mb-14">
              <span className="text-xs font-bold tracking-widest block mb-3" style={{ color: "var(--text-tertiary)" }}>TRACTION</span>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.1}>
                <div className="glass-panel p-8 text-center h-full rounded-2xl flex flex-col justify-center group border border-[var(--glass-border)] hover:border-[#FF5A36] transition-all duration-300">
                  <div className="text-3xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500 group-hover:from-[#FF5A36] group-hover:to-[#FF8C69] transition-all duration-300">
                    <AnimatedCounter value={s.value.replace(/[^0-9.]/g, "")} prefix={s.value.startsWith("$") ? "$" : ""} suffix={s.value.endsWith("M") ? "M" : ""} />
                  </div>
                  <div className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300">
                    {s.label.toUpperCase()}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 overflow-hidden" style={{ background: "var(--bg)" }}>
        <Constellation className="z-0" />
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, var(--bg) 100%)" }}
        />

        <WarpJump
          active={warpActive}
          onComplete={() => navigate("/app")}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <div className="text-center">
              <motion.h2
                className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                style={{ color: "var(--text-primary)", textShadow: "0 0 60px rgba(255, 90, 54, 0.1)" }}
                whileInView={{ scale: [0.95, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Ready to Price<br /><span style={{ color: "var(--accent)" }}>Risk?</span>
              </motion.h2>
              <p className="text-base mb-12 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                Launch a market, stake a position, or integrate the Echo Risk Feed into your protocol.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setWarpActive(true)}
                  className="px-10 py-4 text-xs font-bold tracking-widest transition-all duration-200"
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
                >
                  EXPLORE MARKETS
                </button>
                <a
                  href="https://github.com/echo-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 text-xs font-bold tracking-widest transition-all duration-200 inline-block"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  VIEW ON GITHUB
                </a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6" style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-12">
            {/* Brand */}
            <div>
              <img
                src="/logo.png"
                alt="Echo"
                className="h-7 w-auto object-contain mb-4"
              />
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
                The first on-chain oracle for exploit probability. Real-time risk pricing for DeFi protocols.
              </p>
            </div>

            {/* Social */}
            <div className="md:text-right">
              <h4 className="text-[10px] font-bold tracking-widest mb-4" style={{ color: "var(--text-tertiary)" }}>
                SOCIAL
              </h4>
              <div className="flex items-center gap-4 md:justify-end">
                <a
                  href="https://github.com/Fed-Labs/Echo-Market"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors hover:opacity-100"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://x.com/echosecure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors hover:opacity-100"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              &copy; {new Date().getFullYear()} Fed Labs Ltd. All rights reserved.
            </span>
            <div className="flex items-center gap-6 text-xs" style={{ color: "var(--text-tertiary)" }}>
              <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
              <span style={{ color: "var(--border)" }}>|</span>
              <span className="font-data">Base Sepolia</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes float-particle-anim {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          25% { transform: translate(20px, -40px); opacity: 0.5; }
          50% { transform: translate(-10px, -20px); opacity: 0.3; }
          75% { transform: translate(15px, -50px); opacity: 0.4; }
        }
        .float-particle {
          animation-name: float-particle-anim;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .spotlight-cursor {
          background: radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,90,54,0.08), transparent 40%);
        }
        @keyframes orb-pulse-anim {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
        .orb-pulse {
          animation: orb-pulse-anim 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
