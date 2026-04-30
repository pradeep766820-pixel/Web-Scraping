import { useState, useRef } from "react";
import { Upload, FileText, X, ChevronDown, Sparkles, Package, Building2 } from "lucide-react";

type Props = { onSearch: () => void };

export const SearchCard = ({ onSearch }: Props) => {
  const [product, setProduct] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [country, setCountry] = useState("Germany");
  const [leads, setLeads] = useState(50);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto animate-float-up" style={{ animationDelay: "0.2s" }}>
      {/* Glow halo */}
      <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-[2rem] -z-10" />

      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-glow" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">New buyer search</h3>
            <p className="text-xs text-muted-foreground">Describe your product — we'll find the buyers</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Field label="Product name" icon={<Package className="h-3.5 w-3.5" />}>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Industrial pressure sensor"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </Field>
          <Field label="Manufacturer (optional)" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. Acme Sensors GmbH"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </Field>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border border-dashed p-6 text-center transition-all ${
            dragOver
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-glow" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="h-7 w-7 rounded-md hover:bg-white/10 flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${dragOver ? "bg-primary/20 scale-110" : "bg-white/5"}`}>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium">Drop image or PDF datasheet</div>
                <div className="text-xs text-muted-foreground">PNG, JPG or PDF up to 10MB</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Field label="Country">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-base">🇩🇪</span>
                <span className="text-sm">{country}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option>Germany</option>
                <option>Austria</option>
                <option>Switzerland</option>
                <option>Netherlands</option>
              </select>
            </div>
          </Field>
          <Field label={`Number of leads — ${leads}`}>
            <input
              type="range"
              min={10}
              max={200}
              step={10}
              value={leads}
              onChange={(e) => setLeads(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </Field>
        </div>

        <button
          onClick={onSearch}
          className="group relative w-full mt-6 h-12 rounded-xl bg-gradient-primary text-white font-semibold text-sm shadow-glow hover:shadow-[0_0_60px_hsl(240_95%_65%/0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Find buyers
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <label className="block">
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
      {icon}
      {label}
    </div>
    <div className="relative h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center hover:border-white/15 focus-within:border-primary/50 focus-within:bg-white/[0.05] transition-colors">
      {children}
    </div>
  </label>
);
