import { Sparkles, FolderKanban, Settings, Bell } from "lucide-react";

export const TopNav = () => {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-white/[0.06] backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-md opacity-50 -z-10" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold tracking-tight">Reachly</span>
                <span className="text-[10px] text-muted-foreground font-medium">AI Buyer Finder</span>
              </div>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              <NavItem icon={<FolderKanban className="h-4 w-4" />} label="Projects" active />
              <NavItem icon={<Sparkles className="h-4 w-4" />} label="Discover" />
              <NavItem icon={<Settings className="h-4 w-4" />} label="Settings" />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-white shadow-glow">
              MK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <button className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium transition-colors ${active ? "bg-white/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
    {icon}
    {label}
  </button>
);
