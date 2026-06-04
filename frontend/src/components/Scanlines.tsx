export function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] opacity-20" />
      <div className="absolute inset-0 animate-scanline bg-gradient-to-b from-transparent via-echo-amber/3 to-transparent h-32 opacity-30" />
    </div>
  );
}
