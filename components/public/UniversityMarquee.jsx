import { useState } from "react";
import { Pause, Play } from "lucide-react";

const universities = [
  { short: "UIU", name: "United International University", featured: true },
  { short: "DU", name: "University of Dhaka" },
  { short: "BUET", name: "Bangladesh University of Engineering and Technology" },
  { short: "JU", name: "Jahangirnagar University" },
  { short: "RU", name: "University of Rajshahi" },
  { short: "CU", name: "University of Chittagong" },
  { short: "SUST", name: "Shahjalal University of Science and Technology" },
  { short: "KUET", name: "Khulna University of Engineering and Technology" },
  { short: "RUET", name: "Rajshahi University of Engineering and Technology" },
  { short: "CUET", name: "Chittagong University of Engineering and Technology" },
  { short: "KU", name: "Khulna University" },
  { short: "JnU", name: "Jagannath University" },
  { short: "BAU", name: "Bangladesh Agricultural University" },
  { short: "BUP", name: "Bangladesh University of Professionals" },
  { short: "BUTEX", name: "Bangladesh University of Textiles" },
  { short: "NSU", name: "North South University" },
  { short: "BRACU", name: "BRAC University" },
  { short: "AIUB", name: "American International University-Bangladesh" },
  { short: "EWU", name: "East West University" },
  { short: "IUB", name: "Independent University, Bangladesh" },
  { short: "AUST", name: "Ahsanullah University of Science and Technology" },
  { short: "DIU", name: "Daffodil International University" },
  { short: "UAP", name: "University of Asia Pacific" },
  { short: "ULAB", name: "University of Liberal Arts Bangladesh" },
  { short: "IUBAT", name: "International University of Business Agriculture and Technology" },
  { short: "SEU", name: "Southeast University" },
  { short: "GUB", name: "Green University of Bangladesh" },
  { short: "BUBT", name: "Bangladesh University of Business and Technology" },
  { short: "UITS", name: "University of Information Technology and Sciences" },
  { short: "WUB", name: "World University of Bangladesh" },
  { short: "SUB", name: "State University of Bangladesh" },
  { short: "Stamford", name: "Stamford University Bangladesh" },
  { short: "CUB", name: "Canadian University of Bangladesh" },
  { short: "IIUC", name: "International Islamic University Chittagong" },
  { short: "PU", name: "Primeasia University" },
  { short: "NUB", name: "Northern University Bangladesh" },
  { short: "BU", name: "Bangladesh University" },
  { short: "MU", name: "Metropolitan University" },
  { short: "LU", name: "Leading University" },
  { short: "PUC", name: "Premier University" },
];

function UniversityGroup({ duplicate = false }) {
  return (
    <div className="university-group" aria-hidden={duplicate || undefined}>
      {universities.map((university) => (
        <span
          key={`${duplicate ? "copy-" : ""}${university.short}`}
          className={`university-name ${university.featured ? "university-name-featured" : ""}`}
          title={university.name}
        >
          <b>{university.short}</b>
          <small>{university.name}</small>
        </span>
      ))}
    </div>
  );
}

export default function UniversityMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="university-strip border-y border-ink/[0.07] bg-white/35 py-5">
      <div className="page-shell grid grid-cols-[minmax(0,1fr)_40px] items-center gap-4 lg:grid-cols-[240px_minmax(0,1fr)_44px]">
        <span className="col-span-2 text-xs font-extrabold uppercase tracking-[0.16em] text-muted lg:col-span-1">
          Built for ambitious students
        </span>
        <div
          className={`university-viewport ${paused ? "university-viewport-paused" : ""}`}
          aria-label="Bangladeshi university community"
          tabIndex="0"
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="university-track">
            <UniversityGroup />
            <UniversityGroup duplicate />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          className="theme-toggle !h-9 !w-9"
          aria-label={paused ? "Resume university names" : "Pause university names"}
          aria-pressed={paused}
        >
          {paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
        </button>
      </div>
    </section>
  );
}
