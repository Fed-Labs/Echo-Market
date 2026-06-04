import { useEffect, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;
const listeners = new Set<(t: ToastItem) => void>();

export function showToast(message: string, type: ToastItem["type"] = "info") {
  const t = { id: ++toastId, message, type };
  listeners.forEach((cb) => cb(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const cb = (t: ToastItem) => setToasts((prev) => [...prev, t]);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const colorMap = {
    success: { border: "rgba(0, 212, 170, 0.2)", bg: "rgba(0, 212, 170, 0.05)", text: "var(--positive)" },
    error: { border: "rgba(255, 59, 92, 0.2)", bg: "rgba(255, 59, 92, 0.05)", text: "var(--negative)" },
    info: { border: "rgba(255, 90, 54, 0.2)", bg: "rgba(255, 90, 54, 0.05)", text: "var(--accent)" },
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const colors = colorMap[t.type];
        return (
          <div
            key={t.id}
            className="px-4 py-3 text-xs font-bold tracking-wider"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
