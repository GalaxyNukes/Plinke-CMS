// Curated Google Fonts for the portfolio site.
// `value` = exact CSS font-family name (also used for Google Fonts URL with spaces → +)
// `weights` = available weights for that font

export interface FontOption {
  label: string;
  value: string;
  weights: number[];
  category: "sans" | "serif" | "display" | "mono";
}

export const DISPLAY_FONTS: FontOption[] = [
  { label: "Syne (Default)", value: "Syne", weights: [400, 600, 700, 800], category: "sans" },
  { label: "Space Grotesk", value: "Space Grotesk", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Outfit", value: "Outfit", weights: [300, 400, 500, 600, 700, 800, 900], category: "sans" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Unbounded", value: "Unbounded", weights: [200, 300, 400, 500, 600, 700, 800, 900], category: "display" },
  { label: "Oswald", value: "Oswald", weights: [200, 300, 400, 500, 600, 700], category: "display" },
  { label: "Raleway", value: "Raleway", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: "sans" },
  { label: "Barlow Condensed", value: "Barlow Condensed", weights: [300, 400, 500, 600, 700, 800], category: "display" },
  { label: "Bebas Neue", value: "Bebas Neue", weights: [400], category: "display" },
  { label: "Anton", value: "Anton", weights: [400], category: "display" },
  { label: "Archivo Black", value: "Archivo Black", weights: [400], category: "display" },
  { label: "DM Serif Display", value: "DM Serif Display", weights: [400], category: "serif" },
  { label: "Playfair Display", value: "Playfair Display", weights: [400, 500, 600, 700, 800, 900], category: "serif" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond", weights: [300, 400, 500, 600, 700], category: "serif" },
  { label: "Fraunces", value: "Fraunces", weights: [300, 400, 500, 600, 700, 800, 900], category: "serif" },
  { label: "Inter", value: "Inter", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Manrope", value: "Manrope", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
];

export const BODY_FONTS: FontOption[] = [
  { label: "DM Sans (Default)", value: "DM Sans", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Inter", value: "Inter", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Poppins", value: "Poppins", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Nunito Sans", value: "Nunito Sans", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Manrope", value: "Manrope", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Work Sans", value: "Work Sans", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Outfit", value: "Outfit", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Karla", value: "Karla", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Mulish", value: "Mulish", weights: [300, 400, 500, 600, 700, 800], category: "sans" },
  { label: "Lato", value: "Lato", weights: [300, 400, 700], category: "sans" },
  { label: "Source Sans 3", value: "Source Sans 3", weights: [300, 400, 500, 600, 700], category: "sans" },
  { label: "Syne", value: "Syne", weights: [400, 600, 700, 800], category: "sans" },
];

// Build a Google Fonts URL for a list of font families + all their weights
export function buildGoogleFontsUrl(fonts: { family: string; weights: number[] }[]): string {
  if (fonts.length === 0) return "";
  const families = fonts
    .map(({ family, weights }) => {
      const name = family.replace(/ /g, "+");
      const wghts = [...new Set(weights)].sort().join(";");
      return `family=${name}:wght@${wghts}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
