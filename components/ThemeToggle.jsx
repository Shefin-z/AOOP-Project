import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to pure black dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      <span className="sr-only">{label}</span>
    </button>
  );
}
