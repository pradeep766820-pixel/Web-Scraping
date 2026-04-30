import { useMemo, useState } from "react";
import { ArrowLeft, Download, Save, ChevronDown } from "lucide-react";
import { MOCK_LEADS, Lead } from "@/lib/mockLeads";
import { FiltersPanel, Filters } from "./FiltersPanel";
import { LeadsTable } from "./LeadsTable";
import { LeadDetailPanel } from "./LeadDetailPanel";

type Props = { onBack: () => void; query: string };

export const ResultsView = ({ onBack, query }: Props) => {
  const [filters, setFilters] = useState<Filters>({ industries: [], types: [], minScore: 0, size: "all" });
  const [selected, setSelected] = useState<Lead | null>(null);
  const [sort, setSort] = useState<"score" | "name">("score");

  const industries = useMemo(() => Array.from(new Set(MOCK_LEADS.map((l) => l.industry))), []);
  const types = useMemo(() => Array.from(new Set(MOCK_LEADS.map((l) => l.type))), []);

  const filtered = useMemo(() => {
    let r = MOCK_LEADS.filter((l) =>
      l.score >= filters.minScore &&
      (filters.industries.length === 0 || filters.industries.includes(l.industry)) &&
      (filters.types.length === 0 || filters.types.includes(l.type)) &&
      (filters.size === "all" || l.size === filters.size)
    );
    r = [...r].sort((a, b) => sort === "score" ? b.score - a.score : a.company.localeCompare(b.company));
    return r;
  }, [filters, sort]);

  const stats = {
    total: filtered.length,
    high: filtered.filter((l) => l.score >= 85).length,
    avg: filtered.length ? Math.round(filtered.reduce((s, l) => s + l.score, 0) / filtered.length) : 0,
  };

  return (
    <div className="container py-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />Back
          </button>
          <h1 className="text-2xl font-bold tracking-tight">
            Buyers for <span className="text-gradient">{query || "your product"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} qualified leads · {stats.high} high-confidence · avg score {stats.avg}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            >
              <option value="score">Sort: Score</option>
              <option value="name">Sort: Name</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors">
            <Save className="h-3.5 w-3.5" />Save project
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold shadow-glow hover:shadow-[0_0_30px_hsl(240_95%_65%/0.5)] transition-shadow">
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <FiltersPanel filters={filters} setFilters={setFilters} industries={industries} types={types} />
        <div className="flex-1 min-w-0">
          <LeadsTable leads={filtered} onSelect={setSelected} />
        </div>
      </div>

      <LeadDetailPanel lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
