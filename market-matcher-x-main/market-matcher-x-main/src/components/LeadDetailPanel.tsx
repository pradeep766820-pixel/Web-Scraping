import { X, ExternalLink, AlertTriangle, MapPin, Users, Building2 } from "lucide-react";
import { Lead } from "@/lib/mockLeads";
import { ScoreBadge } from "./ScoreBadge";
import { useEffect } from "react";

type Props = { lead: Lead | null; onClose: () => void };

export const LeadDetailPanel = ({ lead, onClose }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!lead) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-fade-in" />
      <aside className="fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 animate-slide-in-right">
        <div className="h-full glass-strong border-l border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <ScoreBadge score={lead.score} />
                  <span className="text-xs text-muted-foreground">Confidence score</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight truncate">{lead.company}</h2>
                <a href="#" className="text-xs text-primary-glow inline-flex items-center gap-1 mt-1 hover:underline">
                  {lead.website} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Meta icon={<Building2 className="h-3 w-3" />} label={lead.type} />
              <Meta icon={<Users className="h-3 w-3" />} label={lead.size} />
              <Meta icon={<MapPin className="h-3 w-3" />} label={lead.location} />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
            <Section title="Why this company is a fit">
              <p className="text-sm leading-relaxed text-foreground/90">{lead.fitReason}</p>
            </Section>

            <Section title="Confidence breakdown">
              <div className="space-y-3">
                {lead.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-muted-foreground">{b.label}</span>
                      <span className="text-xs font-mono font-semibold">{b.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-700"
                        style={{ width: `${b.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Evidence (${lead.evidence.length})`}>
              <div className="space-y-2.5">
                {lead.evidence.map((e, i) => (
                  <a key={i} href="#" className="block p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-medium group-hover:text-primary-glow transition-colors">{e.title}</div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{e.snippet}</p>
                    <div className="text-[11px] text-muted-foreground/70 mt-1.5 font-mono">{e.url}</div>
                  </a>
                ))}
              </div>
            </Section>

            {lead.risks.length > 0 && (
              <Section title="Risk flags">
                <div className="space-y-2">
                  {lead.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-warning/5 border border-warning/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground/90">{r}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 flex gap-2">
            <button className="flex-1 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              Save lead
            </button>
            <button className="flex-1 h-10 rounded-lg bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:shadow-[0_0_40px_hsl(240_95%_65%/0.5)] transition-shadow">
              Contact
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">{title}</div>
    {children}
  </div>
);

const Meta = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-white/[0.03] border border-white/5 text-xs text-muted-foreground">
    {icon}<span className="truncate">{label}</span>
  </div>
);
