import { Link, useLocation } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const NAV = [
  { path: "/app", label: "Markets" },
  { path: "/create", label: "Create" },
  { path: "/oracle", label: "Oracle" },
  { path: "/submit", label: "Submit" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/guardian", label: "Guardian" },
  { path: "/docs", label: "Docs" },
];

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { login, logout, authenticated, ready } = usePrivy();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Suppress unused warning — kept for future dropdown expansion
  void walletDropdownOpen;

  const handleLogout = () => {
    disconnect();
    logout();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isLanding ? "transparent" : "rgba(6,6,10,0.85)",
        backdropFilter: isLanding ? "none" : "blur(20px)",
        borderBottom: isLanding ? "none" : "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Echo"
              className="h-7 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map((n) => (
              <Link
                key={n.path}
                to={n.path}
                className="px-3 py-1.5 text-xs font-medium transition-colors duration-200 relative"
                style={{
                  color: location.pathname === n.path ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== n.path) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                {n.label}
                {location.pathname === n.path && (
                  <motion.div
                    layoutId="header-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px"
                    style={{ background: "var(--accent)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address && authenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors duration-200"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--positive)" }}
              />
              <span className="font-data">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (ready) login();
                }}
                className="px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200"
                style={{
                  background: "var(--accent)",
                  color: "var(--bg)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                CONNECT
              </button>
            </div>
          )}

          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid var(--border)", background: "rgba(6,6,10,0.95)" }}
          >
            <nav className="px-6 py-3 space-y-0.5">
              {NAV.map((n) => (
                <Link
                  key={n.path}
                  to={n.path}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium"
                  style={{
                    color: location.pathname === n.path ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
