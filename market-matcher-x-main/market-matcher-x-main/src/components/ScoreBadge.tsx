export const ScoreBadge = ({ score }: { score: number }) => {
  const tier = score >= 85 ? "high" : score >= 70 ? "med" : "low";
  const styles = {
    high: "bg-success/15 text-success border-success/30 shadow-[0_0_20px_hsl(142_76%_50%/0.2)]",
    med: "bg-warning/15 text-warning border-warning/30",
    low: "bg-destructive/15 text-destructive border-destructive/30",
  }[tier];
  return (
    <div className={`inline-flex items-center justify-center min-w-[44px] h-7 px-2 rounded-md border text-xs font-semibold font-mono ${styles}`}>
      {score}
    </div>
  );
};
