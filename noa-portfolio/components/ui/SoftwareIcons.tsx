// Software logo icons as inline SVGs.
// Using clean monochrome SVG paths — no external image dependencies.
// Each icon is 20×20, rendered in the project card title row.

interface SoftwareIconProps {
  size?: number;
  className?: string;
}

export const SoftwareIcons: Record<string, (props: SoftwareIconProps) => JSX.Element> = {

  maya: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Maya">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#00ADEF" opacity="0.15"/>
      <path d="M12 2L2 7l10 5 10-5L12 2z" fill="#00ADEF" opacity="0.4"/>
      <path d="M2 7v10l10 5V12L2 7z" fill="#00ADEF" opacity="0.7"/>
      <path d="M22 7v10l-10 5V12l10-5z" fill="#00ADEF"/>
      <text x="7" y="16" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">M</text>
    </svg>
  ),

  unreal: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Unreal Engine">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 8h3c1.66 0 3 1.34 3 3s-1.34 3-3 3H9V8zm2 4.5h1c.83 0 1.5-.67 1.5-1.5S12.83 9.5 12 9.5h-1v3z"/>
    </svg>
  ),

  unity: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Unity">
      <path d="M13.5 3.5L21 7.5v9l-7.5 4-7.5-4v-9l7.5-4zM12 2L3 6.5v11L12 22l9-4.5v-11L12 2zm0 5.5l4 7-4 2-4-2 4-7z"/>
    </svg>
  ),

  blender: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Blender">
      <path d="M12.51 13.214c.046-.8.438-1.506 1.03-2.006L10.55 8.5H5.75a.75.75 0 010-1.5h6l3.75 3.75c.637-.263 1.34-.387 2.067-.344a4.75 4.75 0 11-5.057 2.808zM17.5 16a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5z"/>
      <circle cx="17.5" cy="13.25" r="1.25"/>
      <path d="M10.5 6.5l-6 .001M7.5 3.5l3 3-3 3"/>
    </svg>
  ),

  motionbuilder: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="MotionBuilder">
      <rect width="24" height="24" rx="4" fill="#0696D7" opacity="0.15"/>
      <path d="M6 17V7l4 5 4-5v10" stroke="#0696D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18" cy="12" r="2" fill="#0696D7"/>
      <path d="M14 12h2" stroke="#0696D7" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  houdini: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Houdini">
      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" fill="#FF6600" opacity="0.15"/>
      <path d="M8 8v8M8 12h8M16 8v8" stroke="#FF6600" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  "3dsmax": ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="3ds Max">
      <rect width="24" height="24" rx="4" fill="#007AFF" opacity="0.12"/>
      <text x="3" y="16" fontSize="8" fontWeight="900" fill="#007AFF" fontFamily="Arial">3DS</text>
      <text x="3" y="22" fontSize="7" fontWeight="700" fill="#007AFF" fontFamily="Arial" opacity="0.7">MAX</text>
    </svg>
  ),

  cinema4d: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Cinema 4D">
      <circle cx="12" cy="12" r="9" fill="#011A6A" opacity="0.12"/>
      <circle cx="12" cy="12" r="9" stroke="#011A6A" strokeWidth="1.5" fill="none"/>
      <path d="M15 9a4 4 0 000 6M9 9a4 4 0 010 6" stroke="#011A6A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  zbrush: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="ZBrush">
      <rect width="24" height="24" rx="4" fill="#E84040" opacity="0.12"/>
      <path d="M7 8h10L7 16h10" stroke="#E84040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  substance: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Substance Painter">
      <rect width="24" height="24" rx="12" fill="#FF5A00" opacity="0.12"/>
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5" stroke="#FF5A00" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3" stroke="#FF5A00" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="#FF5A00"/>
    </svg>
  ),

  perforce: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Perforce">
      <rect width="24" height="24" rx="4" fill="#404040" opacity="0.12"/>
      <text x="4" y="16" fontSize="9" fontWeight="900" fill="#404040" fontFamily="Arial">P4</text>
    </svg>
  ),

  git: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Git">
      <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.602-.712.719-1.873.719-2.585 0-.713-.719-.713-1.881 0-2.602.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.608-.406-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/>
    </svg>
  ),
};

// Tooltip wrapper + icon renderer for a list of software slugs
export function SoftwareIconList({
  software,
  size = 18,
}: {
  software: string[];
  size?: number;
}) {
  if (!software?.length) return null;

  return (
    <div className="flex items-center gap-1.5" aria-label="Software used">
      {software.map((slug) => {
        const Icon = SoftwareIcons[slug];
        if (!Icon) return null;
        return (
          <span
            key={slug}
            title={slug.charAt(0).toUpperCase() + slug.slice(1).replace(/([A-Z])/g, " $1")}
            className="opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <Icon size={size} />
          </span>
        );
      })}
    </div>
  );
}
