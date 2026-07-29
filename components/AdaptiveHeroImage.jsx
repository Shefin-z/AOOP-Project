import { useTheme } from "../lib/theme";

export default function AdaptiveHeroImage({
  alt,
  className = "",
  imageClassName = "",
}) {
  const { isDark } = useTheme();
  const source = isDark
    ? "/careerforge-hero-dark-v2.webp"
    : "/careerforge-hero-light-v2.webp";

  return (
    <div
      className={`adaptive-hero ${className}`}
      role="img"
      aria-label={alt}
    >
      <img
        src={source}
        alt=""
        aria-hidden="true"
        width="1586"
        height="992"
        decoding="async"
        fetchPriority="high"
        className={`adaptive-hero-image opacity-100 ${imageClassName}`}
      />
    </div>
  );
}
