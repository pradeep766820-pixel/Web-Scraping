import { Filter } from "lucide-react";

export type Filters = {
  industries: string[];
  types: string[];
  minScore: number;
  size: string;
};

type Props = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  industries: string[];
  types: string[];
};

export const FiltersPanel = ({ filters, setFilters, industries, types }: Props) => {
  const toggle = (key: "industries" | "types", val: string) => {
    const arr = filters[key];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] });
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="glass rounded-2xl p-5 sticky top-24">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary-glow" />
            <h3 className="text-sm font-semibold">Filters</h3>
          </div>
          <button
            onClick={() => setFilters({ industries: [], types: [], minScore: 0, size: "all" })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>

        <Section title="Confidence score">
          <div className="px-1">
            <input
              type="range" min={0} max={100} step={5}
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>≥ {filters.minScore}</span>
              <span>100</span>
            </div>
          </div>
        </Section>

        <Section title="Industry">
          <div className="space-y-1.5">
            {industries.map((i) => (
              <Check key={i} checked={filters.industries.includes(i)} onClick={() => toggle("industries", i)} label={i} />
            ))}
          </div>
        </Section>

        <Section title="Company type">
          <div className="space-y-1.5">
            {types.map((t) => (
              <Check key={t} checked={filters.types.includes(t)} onClick={() => toggle("types", t)} label={t} />
            ))}
          </div>
        </Section>

        <Section title="Company size">
          <select
            value={filters.size}
            onChange={(e) => setFilters({ ...filters, size: e.target.value })}
            className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="all">All sizes</option>
            <option>1-50</option>
            <option>50-500</option>
            <option>500-5,000</option>
            <option>5,000-10,000</option>
            <option>10,000+</option>
          </select>
        </Section>
      </div>
    </aside>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="py-4 border-t border-white/5 first-of-type:border-t-0">
    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">{title}</div>
    {children}
  </div>
);

const Check = ({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) => (
  <button onClick={onClick} className="flex items-center gap-2.5 w-full text-left group">
    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
      checked ? "bg-primary border-primary shadow-glow" : "border-white/20 group-hover:border-white/40"
    }`}>
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </div>
    <span className={`text-sm ${checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>{label}</span>
  </button>
);
