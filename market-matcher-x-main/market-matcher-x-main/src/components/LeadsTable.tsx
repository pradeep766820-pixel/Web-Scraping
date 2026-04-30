import { ExternalLink, Eye, FileText } from "lucide-react";
import { Lead } from "@/lib/mockLeads";
import { ScoreBadge } from "./ScoreBadge";

type Props = { leads: Lead[]; onSelect: (l: Lead) => void };

export const LeadsTable = ({ leads, onSelect }: Props) => {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
              <th className="text-left font-medium px-5 py-3.5">Score</th>
              <th className="text-left font-medium px-3 py-3.5">Company</th>
              <th className="text-left font-medium px-3 py-3.5 hidden md:table-cell">Industry</th>
              <th className="text-left font-medium px-3 py-3.5 hidden lg:table-cell">Type</th>
              <th className="text-left font-medium px-3 py-3.5 hidden xl:table-cell">Why this fits</th>
              <th className="text-center font-medium px-3 py-3.5 hidden md:table-cell">Evidence</th>
              <th className="text-right font-medium px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, idx) => (
              <tr
                key={l.id}
                onClick={() => onSelect(l)}
                className="group border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/[0.025] transition-colors animate-float-up"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <td className="px-5 py-4"><ScoreBadge score={l.score} /></td>
                <td className="px-3 py-4">
                  <div className="font-medium group-hover:text-primary-glow transition-colors">{l.company}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <ExternalLink className="h-3 w-3" />{l.website}
                  </div>
                </td>
                <td className="px-3 py-4 hidden md:table-cell">
                  <span className="text-muted-foreground">{l.industry}</span>
                </td>
                <td className="px-3 py-4 hidden lg:table-cell">
                  <span className="inline-flex h-6 px-2 items-center rounded-md bg-white/5 text-xs">{l.type}</span>
                </td>
                <td className="px-3 py-4 hidden xl:table-cell max-w-xs">
                  <p className="text-xs text-muted-foreground line-clamp-2">{l.fitReason}</p>
                </td>
                <td className="px-3 py-4 hidden md:table-cell text-center">
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />{l.evidence.length}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(l); }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary-glow text-xs font-medium transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-sm font-medium mb-1">No leads match your filters</div>
          <div className="text-xs text-muted-foreground">Try a broader product category or relax filters</div>
        </div>
      )}
    </div>
  );
};
