import { Link } from "../lib/router";

export default function Brand({ href = "/", compact = false }) {
  return (
    <Link to={href} className="inline-flex items-center gap-2.5 text-ink" aria-label="CareerForge home">
      <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-ink text-white shadow-md">
        <img
          src="/careercube-mark-forward-v1.png"
          alt=""
          aria-hidden="true"
          className={compact ? "h-5 w-5 object-contain" : "h-6 w-6 object-contain"}
        />
      </span>
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-[-0.04em]">
          Career<span className="text-cobalt">Forge</span>
        </span>
      )}
    </Link>
  );
}
