import { useTheme } from "../lib/theme";

export default function AdaptiveHeroImage({
  alt,
  className = "",
  imageClassName = "",
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`adaptive-hero ${className}`}
      role="img"
      aria-label={alt}
    >
      <img
        src="/careercube-hero-graduation-light.jpg"
        alt=""
        aria-hidden="true"
        className={`adaptive-hero-image ${imageClassName} ${isDark ? "opacity-0" : "opacity-100"}`}
      />
      <img
        src="/careercube-hero-graduation-dark.png"
        alt=""
        aria-hidden="true"
        className={`adaptive-hero-image ${imageClassName} ${isDark ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
