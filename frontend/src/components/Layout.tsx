import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { ToastContainer } from "./Toast";
import { SmoothScrollProvider } from "./SmoothScroll";
import { CursorGlow } from "./CursorGlow";

export function Layout() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="noise-overlay" />
        <CursorGlow />
        <Header />
        <main className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </SmoothScrollProvider>
  );
}
