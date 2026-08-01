import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "../../lib/router";
import Brand from "../Brand";
import ThemeToggle from "../ThemeToggle";

const navigation = [
  { label: "Platform", href: "/#platform", kind: "anchor" },
  { label: "How it works", href: "/#journey", kind: "anchor" },
  { label: "Community", href: "/community", id: "community" },
  { label: "Resources", href: "/resources", id: "resources" },
];

function PublicNavLink({ item, current, mobile = false, onNavigate }) {
  const active = item.id === current;
  const className = mobile
    ? `dash-side-link ${active ? "!bg-ink !text-white" : ""}`
    : `btn-ghost ${active ? "!bg-ink/[0.07] !text-ink" : ""}`;
  const shared = {
    className,
    onClick: onNavigate,
    ...(active ? { "aria-current": "page" } : {}),
  };

  if (item.kind === "anchor") {
    return <a href={item.href} {...shared}>{item.label}</a>;
  }

  return <Link to={item.href} {...shared}>{item.label}</Link>;
}

export function PublicHeader({ current = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="page-shell relative z-50 pt-5">
      <nav className="glass flex h-[70px] items-center justify-between rounded-[22px] px-4 sm:px-5">
        <Brand href="/" />
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <PublicNavLink key={item.label} item={item} current={current} />
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <Link to="/login/admin" className="btn-ghost">Admin</Link>
          <Link to="/login/student" className="btn-primary min-h-11 px-4">
            Student login <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass-strong absolute left-5 right-5 top-24 z-50 animate-enter rounded-[22px] p-3 sm:hidden">
          {navigation.map((item) => (
            <PublicNavLink
              key={item.label}
              item={item}
              current={current}
              mobile
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink/10 pt-3">
            <Link to="/login/admin" className="btn-secondary">Admin</Link>
            <Link to="/login/student" className="btn-primary">Student login</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-ink/[0.08] py-8">
      <div className="page-shell flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <Brand href="/" />
        <p className="text-xs text-muted">© 2026 CareerForge. Built for the careers still becoming.</p>
        <div className="flex gap-1">
          {["Privacy", "Terms", "Support"].map((item) => (
            <button key={item} className="btn-ghost text-xs">{item}</button>
          ))}
        </div>
      </div>
    </footer>
  );
}
