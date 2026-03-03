interface PlaceholderImageProps {
  className?: string;
  text?: string;
  gradient?: string;
}

export default function PlaceholderImage({
  className = "",
  text = "Upload image in Sanity Studio",
  gradient = "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
}: PlaceholderImageProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      <span className="text-white/20 text-sm font-body text-center px-4">
        {text}
      </span>
    </div>
  );
}
