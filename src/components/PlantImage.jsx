import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

function isUsableImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase().includes("upgrade_access")) return false;
  return true;
}

export default function PlantImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  loading,
  iconSize = 32,
  showLabel = true,
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!isUsableImageUrl(src) || hasError) {
    return (
      <div
        className={`image-placeholder ${placeholderClassName}`.trim()}
        role="img"
        aria-label={alt || "Brak zdjęcia rośliny"}
      >
        <span className="image-placeholder-inner">
          <span className="image-placeholder-badge" aria-hidden="true">
            <Sprout size={iconSize} strokeWidth={1.7} />
          </span>
          {showLabel && <span className="image-placeholder-text">Brak zdjęcia</span>}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || undefined}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
