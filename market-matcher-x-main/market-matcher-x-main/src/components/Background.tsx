export const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-grid" />
    {/* Floating gradient blobs */}
    <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-primary/30 blur-[120px] animate-blob-float" />
    <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-accent/25 blur-[120px] animate-blob-float" style={{ animationDelay: "-6s" }} />
    <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full bg-primary-glow/20 blur-[120px] animate-blob-float" style={{ animationDelay: "-12s" }} />
  </div>
);
