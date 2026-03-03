import { Mail, Linkedin, Youtube, Twitter } from "lucide-react";

interface FooterProps {
  settings: any;
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
};

export function Footer({ settings }: FooterProps) {
  const email = settings?.email || "hello@noaplinke.com";
  const footerText = settings?.footerText || "Let's make something awesome";
  const copyright = settings?.copyright || "© 2025 Noa Plinke";
  const socials = settings?.socialLinks || [];

  return (
    <footer
      id="contact"
      className="rounded-card -mt-5 relative z-10 py-20 px-10 text-center overflow-hidden"
      style={{ background: "var(--bg-dark)" }}
    >
      <div className="grain-overlay" />
      <div className="relative z-10">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-8 leading-tight">
          {footerText.split(" ").slice(0, -1).join(" ")}{" "}
          <span style={{ color: "var(--accent)" }}>
            {footerText.split(" ").slice(-1)}
          </span>
        </h2>

        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.03] hover:bg-white"
          style={{ background: "var(--accent)", color: "var(--bg-dark)" }}
        >
          <Mail size={16} /> Send me an email
        </a>

        {/* Socials */}
        {socials.length > 0 && (
          <div className="flex justify-center gap-3 mt-12">
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

        <p className="text-white/25 text-xs mt-12">{copyright}</p>
      </div>
    </footer>
  );
}
