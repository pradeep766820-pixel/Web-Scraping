import { useEffect, useState } from "react";
import { Check, Brain, Network, Globe2, Target } from "lucide-react";

const STEPS = [
  { label: "Analyzing product", icon: Brain },
  { label: "Mapping industries", icon: Network },
  { label: "Searching companies in Germany", icon: Globe2 },
  { label: "Scoring leads", icon: Target },
];

type Props = { onComplete: () => void };

export const LoadingState = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        const np = p + 1.2;
        if (np >= 100) { clearInterval(timer); setTimeout(onComplete, 350); return 100; }
        return np;
      });
    }, 35);
    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    setStep(Math.min(STEPS.length - 1, Math.floor(progress / 25)));
  }, [progress]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center animate-fade-in">
        {/* Animated brain/network */}
        <div className="relative mx-auto w-48 h-48 mb-10">
          <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-3xl animate-pulse" />
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(240 95% 70%)" />
                <stop offset="100%" stopColor="hsl(190 95% 60%)" />
              </linearGradient>
            </defs>
            {/* connections */}
            {[
              [100, 100, 40, 60], [100, 100, 160, 50], [100, 100, 50, 150],
              [100, 100, 160, 150], [100, 100, 100, 30], [100, 100, 100, 170],
              [40, 60, 100, 30], [160, 50, 160, 150], [50, 150, 100, 170],
            ].map((c, i) => (
              <line key={i} x1={c[0]} y1={c[1]} x2={c[2]} y2={c[3]}
                stroke="url(#ng)" strokeWidth="1" opacity="0.5"
                strokeDasharray="2 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
              </line>
            ))}
            {/* nodes */}
            {[[100, 100, 5], [40, 60, 3], [160, 50, 3], [50, 150, 3], [160, 150, 3], [100, 30, 3], [100, 170, 3]].map((n, i) => (
              <circle key={i} cx={n[0]} cy={n[1]} r={n[2]} fill="url(#ng)">
                <animate attributeName="r" values={`${n[2]};${n[2]+2};${n[2]}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
              </circle>
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="h-9 w-9 text-primary-glow" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-2 text-gradient">
          Finding your ideal buyers
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Our AI is scanning thousands of companies across Germany
        </p>

        {/* Progress bar */}
        <div className="relative h-2 rounded-full bg-white/5 overflow-hidden mb-8 max-w-md mx-auto">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-primary transition-all duration-150 shadow-glow"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ left: `${Math.max(0, progress - 24)}%` }}
          />
        </div>

        {/* Steps */}
        <div className="glass-strong rounded-2xl p-5 max-w-md mx-auto">
          <div className="space-y-3">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const Icon = s.icon;
              return (
                <div key={i} className={`flex items-center gap-3 transition-all ${i > step ? "opacity-30" : "opacity-100"}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                    done ? "bg-success/20 text-success" : active ? "bg-primary/20 text-primary-glow" : "bg-white/5 text-muted-foreground"
                  }`}>
                    {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className={`h-4 w-4 ${active ? "animate-pulse" : ""}`} />}
                  </div>
                  <span className={`text-sm flex-1 text-left ${active ? "font-medium" : ""}`}>{s.label}</span>
                  {active && (
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
