import { Linkedin, Youtube, Twitter } from "lucide-react";

interface FooterProps {
  settings: any;
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
};

export function Footer({ settings }: FooterProps) {
  const copyright = settings?.copyright || "© 2025 Noa Plinke";
  const socials = settings?.socialLinks || [];

  return (
    <footer
      className="rounded-card -mt-5 relative z-10 py-10 px-10 text-center overflow-hidden"
      style={{ background: "var(--bg-dark)" }}
    >
      <div className="grain-overlay" />
      <div className="relative z-10">
        {/* Socials */}
        {socials.length > 0 && (
          <div className="flex justify-center gap-3 mb-6">
            {socials.map((s: any) => {
              const Icon = socialIcons[s.platform];
              return (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
                >
                  {Icon ? <Icon size={18} /> : (
                    <span className="font-display font-bold text-xs">
                      {s.platform.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        <p className="text-white/25 text-xs">{copyright}</p>
      </div>
    </footer>
  );
}
