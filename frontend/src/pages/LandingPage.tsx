import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { ParticleSphere } from "../components/ParticleSphere";
import { OrbitingIcons } from "../components/OrbitingIcons";
import { LiveMarkets } from "../components/LiveMarkets";
import { GlassCard } from "../components/GlassCard";
import { LenisWrapper } from "../components/LenisWrapper";
import { LogoDissolve } from "../components/LogoDissolve";

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #FF5A36, #FF8C69, #FF5A36)",
        boxShadow: "0 0 20px #FF5A36, 0 0 60px rgba(255,90,54,0.3)",
      }}
    />
  );
}

function GrainOverlay() {
  return <div className="noise-overlay" />;
}

function DeepGridBackground({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollProgress, [0, 0.20, 0.35, 0.88, 0.92], [0, 0, 0.35, 0.35, 0]);
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(rgba(255, 107, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 107, 0, 0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)",
      }}
    />
  );
}

const STATS = [
  { label: "Active Markets", value: "24" },
  { label: "TVL at Risk", value: "$12.4M" },
  { label: "Verified Exploits", value: "7" },
  { label: "Researchers", value: "143" },
];

export function LandingPage() {
  const { isConnected } = useAccount();
  const { login, ready } = usePrivy();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollProgressRef.current = v;
  });

  // Mechanism section transforms — cards appear one by one with full entry + exit
  const mechanismHeaderOpacity = useTransform(scrollYProgress, [0.28, 0.32, 0.62, 0.66], [0, 1, 1, 0]);
  const mechanismHeaderY = useTransform(scrollYProgress, [0.28, 0.32, 0.62, 0.66], [30, 0, 0, -20]);

  const card1Opacity = useTransform(scrollYProgress, [0.30, 0.36, 0.60, 0.64], [0, 1, 1, 0]);
  const card1Y = useTransform(scrollYProgress, [0.30, 0.36, 0.60, 0.64], [50, 0, 0, -30]);
  const card2Opacity = useTransform(scrollYProgress, [0.34, 0.40, 0.62, 0.66], [0, 1, 1, 0]);
  const card2Y = useTransform(scrollYProgress, [0.34, 0.40, 0.62, 0.66], [50, 0, 0, -30]);
  const card3Opacity = useTransform(scrollYProgress, [0.38, 0.44, 0.64, 0.68], [0, 1, 1, 0]);
  const card3Y = useTransform(scrollYProgress, [0.38, 0.44, 0.64, 0.68], [50, 0, 0, -30]);
  const card4Opacity = useTransform(scrollYProgress, [0.42, 0.48, 0.66, 0.70], [0, 1, 1, 0]);
  const card4Y = useTransform(scrollYProgress, [0.42, 0.48, 0.66, 0.70], [50, 0, 0, -30]);

  return (
    <LenisWrapper>
      <div ref={containerRef} className="relative overflow-x-hidden" style={{ height: "1000vh" }}>
        <ScrollProgressBar />
        <GrainOverlay />

        {/* Fixed Canvas Background */}
        <ParticleSphere scrollProgressRef={scrollProgressRef} />
        <DeepGridBackground scrollProgress={scrollYProgress} />

        {/* Hero tagline above logo */}
        <motion.div
          className="fixed top-[8%] left-0 right-0 z-[4] pointer-events-none px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.06, 0.12], [1, 0.5, 0]),
              y: useTransform(scrollYProgress, [0, 0.12], [0, -30]),
            }}
          >
            <h2 className="text-xl md:text-3xl font-medium tracking-tight text-white mb-2">
              The Oracle for Exploit Probability
            </h2>
            <p className="text-sm md:text-lg font-medium" style={{ color: "var(--accent)" }}>
              Price what everyone fears.
            </p>
          </motion.div>
        </motion.div>

        {/* Logo with pixel dissolve */}
        <LogoDissolve scrollProgressRef={scrollProgressRef} />

        {/* Enter App button — only at 0% hero */}
        <motion.div
          className="fixed bottom-[14%] md:bottom-[10%] left-0 right-0 z-[6] flex items-center justify-center px-6 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.03, 0.08], [1, 0.5, 0]),
            }}
          >
            {!isConnected ? (
            <button
              onClick={() => {
                if (ready) login();
              }}
              className="pointer-events-auto px-10 py-3.5 text-xs font-bold tracking-widest transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #FF5A36, #FF8C69)",
                color: "#030305",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.15) drop-shadow(0 0 20px rgba(255, 90, 54, 0.4))";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ENTER APP
            </button>
          ) : (
            <button
              onClick={() => navigate("/app")}
              className="pointer-events-auto px-10 py-3.5 text-xs font-bold tracking-widest transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #FF5A36, #FF8C69)",
                color: "#030305",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.15) drop-shadow(0 0 20px rgba(255, 90, 54, 0.4))";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ENTER APP
            </button>
          )}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="fixed bottom-6 md:bottom-10 left-0 right-0 z-[9] flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
          >
            <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              SCROLL
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8"
              style={{ background: "linear-gradient(to bottom, #FF5A36, transparent)" }}
            />
          </motion.div>
        </motion.div>

        {/* Orbiting brand icons (12-32% scroll) */}
        <OrbitingIcons scrollProgress={scrollYProgress} />

        {/* Mechanism Section — How It Works (28-70% scroll) */}
        <div className="fixed inset-0 z-[7] flex items-center justify-center px-6 pointer-events-none">
          <div className="max-w-6xl w-full pointer-events-auto py-2 md:py-4">
            {/* Section header */}
            <motion.div
              className="text-center mb-6 md:mb-14"
              style={{ opacity: mechanismHeaderOpacity, y: mechanismHeaderY }}
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="w-8 h-px" style={{ background: "var(--accent)" }} />
                <span className="text-xs font-bold tracking-widest" style={{ color: "var(--accent)" }}>MECHANISM</span>
                <span className="w-8 h-px" style={{ background: "var(--accent)" }} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
                How It Works
              </h2>
              <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-tertiary)" }}>
                Four steps from listing to consumption. Fully autonomous. Fully on-chain.
              </p>
            </motion.div>

            {/* Steps grid — uniform on mobile, asymmetric on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 items-stretch">
              {/* Step 1 */}
              <motion.div style={{ opacity: card1Opacity, y: card1Y }} className="relative h-full">
                <div className="glass-panel h-full p-3 md:p-5 pb-4 md:pb-6 text-center relative rounded-xl border border-transparent hover:border-[#FF5A36]/30 transition-all duration-300 group flex flex-col">
                  <div className="mb-2 md:mb-4 relative w-full flex justify-center flex-shrink-0">
                    <img src="/step-list.png" alt="List" className="w-full h-14 md:h-24 object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div
                    className="w-9 h-9 md:w-14 md:h-14 mx-auto mb-3 flex items-center justify-center relative z-10 rounded-full flex-shrink-0"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 0 20px rgba(255,90,54,0.15)" }}
                  >
                    <span className="text-sm md:text-lg font-black font-data" style={{ color: "var(--accent)" }}>01</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2 flex-shrink-0" style={{ color: "var(--text-primary)" }}>List</h3>
                  <p className="text-[10px] md:text-xs leading-relaxed flex-grow" style={{ color: "var(--text-secondary)" }}>
                    Any protocol lists its smart contracts. No approval. No whitelisting fee.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div style={{ opacity: card2Opacity, y: card2Y }} className="relative h-full">
                <div className="glass-panel h-full p-3 md:p-5 pb-4 md:pb-6 text-center relative rounded-xl border border-transparent hover:border-[#FF5A36]/30 transition-all duration-300 group flex flex-col">
                  <div className="mb-2 md:mb-4 relative w-full flex justify-center flex-shrink-0">
                    <img src="/step-stake.png" alt="Stake" className="w-full h-14 md:h-24 object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div
                    className="w-9 h-9 md:w-14 md:h-14 mx-auto mb-3 flex items-center justify-center relative z-10 rounded-full flex-shrink-0"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 0 20px rgba(255,90,54,0.15)" }}
                  >
                    <span className="text-sm md:text-lg font-black font-data" style={{ color: "var(--accent)" }}>02</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2 flex-shrink-0" style={{ color: "var(--text-primary)" }}>Stake</h3>
                  <p className="text-[10px] md:text-xs leading-relaxed flex-grow" style={{ color: "var(--text-secondary)" }}>
                    Researchers stake USDC to price exploit probability. Short bets on hack. Long bets on safety.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div style={{ opacity: card3Opacity, y: card3Y }} className="relative h-full">
                <div className="glass-panel h-full p-3 md:p-5 pb-4 md:pb-6 text-center relative rounded-xl border border-transparent hover:border-[#FF5A36]/30 transition-all duration-300 group flex flex-col">
                  <div className="mb-2 md:mb-4 relative w-full flex justify-center flex-shrink-0">
                    <img src="/step-resolve.png" alt="Resolve" className="w-full h-14 md:h-24 object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div
                    className="w-9 h-9 md:w-14 md:h-14 mx-auto mb-3 flex items-center justify-center relative z-10 rounded-full flex-shrink-0"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 0 20px rgba(255,90,54,0.15)" }}
                  >
                    <span className="text-sm md:text-lg font-black font-data" style={{ color: "var(--accent)" }}>03</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2 flex-shrink-0" style={{ color: "var(--text-primary)" }}>Resolve</h3>
                  <p className="text-[10px] md:text-xs leading-relaxed flex-grow" style={{ color: "var(--text-secondary)" }}>
                    48h guardian arbitration validates PoCs. Confirmed exploits trigger automatic payouts.
                  </p>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div style={{ opacity: card4Opacity, y: card4Y }} className="relative h-full">
                <div className="glass-panel h-full p-3 md:p-5 pb-4 md:pb-6 text-center relative rounded-xl border border-transparent hover:border-[#FF5A36]/30 transition-all duration-300 group flex flex-col">
                  <div className="mb-2 md:mb-4 relative w-full flex justify-center flex-shrink-0">
                    <img src="/step-consume.png" alt="Consume" className="w-full h-14 md:h-24 object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div
                    className="w-9 h-9 md:w-14 md:h-14 mx-auto mb-3 flex items-center justify-center relative z-10 rounded-full flex-shrink-0"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 0 20px rgba(255,90,54,0.15)" }}
                  >
                    <span className="text-sm md:text-lg font-black font-data" style={{ color: "var(--accent)" }}>04</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2 flex-shrink-0" style={{ color: "var(--text-primary)" }}>Consume</h3>
                  <p className="text-[10px] md:text-xs leading-relaxed flex-grow" style={{ color: "var(--text-secondary)" }}>
                    Money markets, insurers, and derivatives platforms query the live risk feed on-chain.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Live Markets (72-78% scroll) */}
        <LiveMarkets scrollProgress={scrollYProgress} />

        {/* Normal scroll content — Traction + Footer */}
        <div
          className="absolute left-0 right-0 z-10 px-6 pt-24 pb-12"
          style={{ top: "880vh", minHeight: "120vh" }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Traction */}
            <section className="relative py-24 overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,90,54,0.04), transparent)" }}
              />
              <div className="relative">
                <div className="mb-14 text-center">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <span className="w-8 h-px" style={{ background: "var(--text-tertiary)" }} />
                    <span className="text-xs font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>TRACTION</span>
                    <span className="w-8 h-px" style={{ background: "var(--text-tertiary)" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {STATS.map((s, i) => (
                    <GlassCard key={s.label} delay={i * 0.1} className="text-center py-8">
                      <div className="text-3xl md:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
                        {s.value}
                      </div>
                      <div className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">
                        {s.label}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
              <h2
                className="text-4xl md:text-6xl font-black tracking-tighter mb-6"
                style={{ color: "var(--text-primary)", textShadow: "0 0 60px rgba(255, 90, 54, 0.1)" }}
              >
                Ready to Price<br /><span style={{ color: "var(--accent)" }}>Risk?</span>
              </h2>
              <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                Launch a market, stake a position, or integrate the Echo Risk Feed into your protocol.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isConnected ? (
                  <button
                    onClick={() => {
                      if (ready) login();
                    }}
                    className="px-10 py-4 text-xs font-bold tracking-widest transition-all duration-300"
                    style={{ background: "var(--accent)", color: "var(--bg)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
                  >
                    EXPLORE MARKETS
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/app")}
                    className="px-10 py-4 text-xs font-bold tracking-widest transition-all duration-300"
                    style={{ background: "var(--accent)", color: "var(--bg)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
                  >
                    EXPLORE MARKETS
                  </button>
                )}
                <a
                  href="https://github.com/Fed-Labs/Echo-Market"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 text-xs font-bold tracking-widest transition-all duration-300 inline-block"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  VIEW ON GITHUB
                </a>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-10">
                <div>
                  <img src="/logo.png" alt="Echo" className="h-7 w-auto object-contain mb-4" />
                  <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
                    The first on-chain oracle for exploit probability. Real-time risk pricing for DeFi protocols.
                  </p>
                </div>
                <div className="md:text-right">
                  <h4 className="text-[10px] font-bold tracking-widest mb-4" style={{ color: "var(--text-tertiary)" }}>SOCIAL</h4>
                  <div className="flex items-center gap-4 md:justify-end">
                    <a
                      href="https://github.com/Fed-Labs/Echo-Market"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      GitHub
                    </a>
                    <a
                      href="https://x.com/echosecure"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      X
                    </a>
                  </div>
                </div>
              </div>
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
            </footer>
          </div>
        </div>
      </div>
    </LenisWrapper>
  );
}
