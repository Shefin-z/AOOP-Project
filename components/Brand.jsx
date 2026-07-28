import { Link } from "../lib/router";
import { Flame } from "lucide-react";

export default function Brand({ href = "/", compact = false }) {
  return (
    <Link to={href} className="inline-flex items-center gap-2.5 text-ink" aria-label="CareerForge home">
      <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-ink text-white shadow-md">
        <Flame size={compact ? 16 : 19} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-[-0.04em]">
          Career<span className="text-cobalt">Forge</span>
        </span>
      )}
    </Link>
  );
}
