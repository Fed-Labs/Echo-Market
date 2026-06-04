const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function storeSubmission(hash: string, content: string) {
  const res = await fetch(`${API_BASE}/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash, content }),
  });
  if (!res.ok) throw new Error("Failed to store submission");
  return res.json();
}

export async function fetchSubmission(hash: string): Promise<{ hash: string; content: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/submissions/${hash}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
