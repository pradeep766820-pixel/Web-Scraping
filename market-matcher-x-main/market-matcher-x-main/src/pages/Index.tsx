import { useState } from "react";
import { Background } from "@/components/Background";
import { TopNav } from "@/components/TopNav";
import { SearchCard } from "@/components/SearchCard";
import { LoadingState } from "@/components/LoadingState";
import { ResultsView } from "@/components/ResultsView";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

type View = "home" | "loading" | "results";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("Industrial pressure sensor");

  return (
    <div className="relative min-h-screen">
      <Background />
      <TopNav />

      {view === "home" && (
        <main className="relative">
          <section className="container pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full glass text-xs font-medium text-muted-foreground mb-6 animate-float-up">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Now scanning 2.4M+ German companies
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-5 animate-float-up" style={{ animationDelay: "0.1s" }}>
              Find your ideal{" "}
              <span className="text-gradient">buyers</span>
              <br />instantly.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-12 animate-float-up" style={{ animationDelay: "0.15s" }}>
              Turn any product into a list of qualified B2B leads. Drop a name, image, or PDF — our AI finds the companies that need it.
            </p>

            <SearchCard onSearch={() => { setView("loading"); }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto animate-float-up" style={{ animationDelay: "0.4s" }}>
              <Feature icon={<Sparkles />} title="AI-powered matching" desc="GPT-grade reasoning over millions of company signals" />
              <Feature icon={<Zap />} title="Results in seconds" desc="From product input to qualified leads in under 60s" />
              <Feature icon={<ShieldCheck />} title="GDPR compliant" desc="Public-data sources only, no personal scraping" />
            </div>
          </section>
        </main>
      )}

      {view === "loading" && <LoadingState onComplete={() => setView("results")} />}

      {view === "results" && <ResultsView onBack={() => setView("home")} query={query} />}
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="glass rounded-2xl p-5 text-left hover:-translate-y-0.5 hover:border-primary/30 transition-all group">
    <div className="h-9 w-9 rounded-lg bg-gradient-primary/15 border border-primary/20 flex items-center justify-center mb-3 group-hover:shadow-glow transition-all [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-primary-glow">
      {icon}
    </div>
    <div className="text-sm font-semibold mb-1">{title}</div>
    <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
  </div>
);

export default Index;
