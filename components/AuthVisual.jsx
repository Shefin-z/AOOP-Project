import { useTheme } from "../lib/theme";

const artwork = {
  student: {
    light: "/careercube-auth-student-light-v1.jpg",
    dark: "/careercube-auth-student-dark-v1.jpg",
    alt: "Two students planning their careers together in the CareerCube studio",
  },
  admin: {
    light: "/careercube-auth-admin-light-v1.jpg",
    dark: "/careercube-auth-admin-dark-v1.jpg",
    alt: "CareerCube administrators reviewing platform insights together",
  },
};

export default function AuthVisual({ role = "student" }) {
  const { isDark } = useTheme();
  const visual = artwork[role] || artwork.student;

  const moveArtwork = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty("--auth-shift-x", `${x * 14}px`);
    event.currentTarget.style.setProperty("--auth-shift-y", `${y * 10}px`);
    event.currentTarget.style.setProperty("--auth-glow-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--auth-glow-y", `${(y + 0.5) * 100}%`);
  };

  const resetArtwork = (event) => {
    event.currentTarget.style.setProperty("--auth-shift-x", "0px");
    event.currentTarget.style.setProperty("--auth-shift-y", "0px");
    event.currentTarget.style.setProperty("--auth-glow-x", "28%");
    event.currentTarget.style.setProperty("--auth-glow-y", "24%");
  };

  return (
    <div
      className={`auth-visual-stage auth-visual-${role}`}
      role="img"
      aria-label={visual.alt}
      onPointerMove={moveArtwork}
      onPointerLeave={resetArtwork}
    >
      <img
        src={visual.light}
        alt=""
        aria-hidden="true"
        className="auth-visual-layer"
        decoding="async"
        fetchPriority="high"
        style={{ opacity: isDark ? 0 : 1 }}
      />
      <img
        src={visual.dark}
        alt=""
        aria-hidden="true"
        className="auth-visual-layer"
        decoding="async"
        fetchPriority="high"
        style={{ opacity: isDark ? 1 : 0 }}
      />
      <span className="auth-visual-ambient" aria-hidden="true" />
      <span className="auth-visual-grid" aria-hidden="true" />
    </div>
  );
}
