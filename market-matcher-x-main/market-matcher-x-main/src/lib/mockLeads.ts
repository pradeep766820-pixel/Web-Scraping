export type Lead = {
  id: string;
  score: number;
  company: string;
  website: string;
  industry: string;
  type: "Manufacturer" | "Distributor" | "Wholesaler" | "Retailer" | "Service Provider";
  size: string;
  fitReason: string;
  evidence: { title: string; url: string; snippet: string }[];
  risks: string[];
  breakdown: { label: string; value: number }[];
  location: string;
};

export const MOCK_LEADS: Lead[] = [
  {
    id: "1", score: 96, company: "Siemens AG", website: "siemens.com",
    industry: "Industrial Automation", type: "Manufacturer", size: "10,000+",
    location: "München, DE",
    fitReason: "Active procurement of precision sensors across 14 production sites; published RFQ in Q2.",
    evidence: [
      { title: "Siemens Procurement Portal — Sensor RFQ", url: "siemens.com/procurement", snippet: "Open tender for industrial-grade temperature & pressure sensors..." },
      { title: "Industry 4.0 Roadmap 2026", url: "siemens.com/roadmap", snippet: "Expansion of smart-factory deployments requires new sensor arrays..." },
      { title: "Press release — Erlangen plant", url: "siemens.com/news", snippet: "Investment of €120M in modernization including IoT sensor network..." },
    ],
    risks: [],
    breakdown: [
      { label: "Industry match", value: 98 },
      { label: "Procurement signals", value: 95 },
      { label: "Buying power", value: 99 },
      { label: "Geographic fit", value: 92 },
    ],
  },
  {
    id: "2", score: 91, company: "Bosch Rexroth", website: "boschrexroth.com",
    industry: "Hydraulics & Drives", type: "Manufacturer", size: "5,000-10,000",
    location: "Lohr am Main, DE",
    fitReason: "Building automation division actively integrating third-party IoT components.",
    evidence: [
      { title: "Tech Partner Program 2026", url: "boschrexroth.com/partners", snippet: "Seeking sensor & telemetry partners for ctrlX AUTOMATION platform..." },
      { title: "Annual Report — Capex", url: "bosch.com/ir", snippet: "€340M allocated for connected manufacturing components..." },
    ],
    risks: ["Long procurement cycle (6-9 months)"],
    breakdown: [
      { label: "Industry match", value: 94 },
      { label: "Procurement signals", value: 88 },
      { label: "Buying power", value: 95 },
      { label: "Geographic fit", value: 90 },
    ],
  },
  {
    id: "3", score: 87, company: "Festo SE & Co. KG", website: "festo.com",
    industry: "Pneumatics", type: "Manufacturer", size: "10,000+",
    location: "Esslingen, DE",
    fitReason: "Recent partnership announcements signal openness to sensor integrations.",
    evidence: [
      { title: "Festo Innovation Day 2026", url: "festo.com/news", snippet: "Demonstrated open API for sensor integrations across the AX platform..." },
    ],
    risks: [],
    breakdown: [
      { label: "Industry match", value: 90 },
      { label: "Procurement signals", value: 82 },
      { label: "Buying power", value: 92 },
      { label: "Geographic fit", value: 88 },
    ],
  },
  {
    id: "4", score: 82, company: "KUKA AG", website: "kuka.com",
    industry: "Robotics", type: "Manufacturer", size: "10,000+",
    location: "Augsburg, DE",
    fitReason: "Robotics arms require high-precision feedback sensors; RFP issued in March.",
    evidence: [
      { title: "Procurement notice", url: "kuka.com/rfp", snippet: "Seeking suppliers of force-torque and vision sensors..." },
    ],
    risks: ["Existing long-term supplier contracts"],
    breakdown: [
      { label: "Industry match", value: 88 },
      { label: "Procurement signals", value: 80 },
      { label: "Buying power", value: 86 },
      { label: "Geographic fit", value: 78 },
    ],
  },
  {
    id: "5", score: 78, company: "Trumpf GmbH", website: "trumpf.com",
    industry: "Machine Tools", type: "Manufacturer", size: "10,000+",
    location: "Ditzingen, DE",
    fitReason: "Smart factory initiative includes sensor-driven quality control upgrades.",
    evidence: [
      { title: "Trumpf Smart Factory whitepaper", url: "trumpf.com/whitepaper", snippet: "Quality assurance increasingly relies on inline sensor data..." },
    ],
    risks: [],
    breakdown: [
      { label: "Industry match", value: 82 },
      { label: "Procurement signals", value: 74 },
      { label: "Buying power", value: 84 },
      { label: "Geographic fit", value: 76 },
    ],
  },
  {
    id: "6", score: 74, company: "Liebherr-International", website: "liebherr.com",
    industry: "Heavy Machinery", type: "Manufacturer", size: "10,000+",
    location: "Biberach, DE",
    fitReason: "Construction equipment division integrating telematics & sensor packages.",
    evidence: [
      { title: "Liebherr Telematics 2026", url: "liebherr.com", snippet: "Next-gen machines feature 40+ embedded sensors per unit..." },
    ],
    risks: ["Custom certification required"],
    breakdown: [
      { label: "Industry match", value: 78 },
      { label: "Procurement signals", value: 70 },
      { label: "Buying power", value: 88 },
      { label: "Geographic fit", value: 72 },
    ],
  },
  {
    id: "7", score: 69, company: "Voith Group", website: "voith.com",
    industry: "Energy & Paper", type: "Manufacturer", size: "5,000-10,000",
    location: "Heidenheim, DE",
    fitReason: "Hydropower division refit programs include condition-monitoring sensors.",
    evidence: [
      { title: "Voith Hydro modernization", url: "voith.com/hydro", snippet: "Retrofit projects across 12 plants requiring vibration sensors..." },
    ],
    risks: [],
    breakdown: [
      { label: "Industry match", value: 72 },
      { label: "Procurement signals", value: 66 },
      { label: "Buying power", value: 78 },
      { label: "Geographic fit", value: 68 },
    ],
  },
  {
    id: "8", score: 64, company: "Dürr AG", website: "durr.com",
    industry: "Automotive Equipment", type: "Manufacturer", size: "5,000-10,000",
    location: "Bietigheim-Bissingen, DE",
    fitReason: "Paint shop automation increasingly sensor-driven for quality control.",
    evidence: [
      { title: "Dürr automation report", url: "durr.com", snippet: "Smart paint shops use sensor arrays for film thickness..." },
    ],
    risks: ["Industry slowdown in automotive sector"],
    breakdown: [
      { label: "Industry match", value: 68 },
      { label: "Procurement signals", value: 60 },
      { label: "Buying power", value: 70 },
      { label: "Geographic fit", value: 64 },
    ],
  },
  {
    id: "9", score: 58, company: "Heidelberger Druckmaschinen", website: "heidelberg.com",
    industry: "Printing Equipment", type: "Manufacturer", size: "10,000+",
    location: "Heidelberg, DE",
    fitReason: "Press automation includes inline sensor feedback for color & registration.",
    evidence: [
      { title: "Heidelberg Push to Stop", url: "heidelberg.com", snippet: "Autonomous printing requires distributed sensor network..." },
    ],
    risks: ["Declining print market", "Budget constraints"],
    breakdown: [
      { label: "Industry match", value: 62 },
      { label: "Procurement signals", value: 54 },
      { label: "Buying power", value: 60 },
      { label: "Geographic fit", value: 58 },
    ],
  },
  {
    id: "10", score: 52, company: "GEA Group", website: "gea.com",
    industry: "Process Engineering", type: "Distributor", size: "10,000+",
    location: "Düsseldorf, DE",
    fitReason: "Food processing customers request integrated hygienic sensor solutions.",
    evidence: [
      { title: "GEA hygienic design guide", url: "gea.com", snippet: "Sensors meeting EHEDG standards in growing demand..." },
    ],
    risks: ["Distributor margin pressure"],
    breakdown: [
      { label: "Industry match", value: 56 },
      { label: "Procurement signals", value: 48 },
      { label: "Buying power", value: 64 },
      { label: "Geographic fit", value: 52 },
    ],
  },
];
