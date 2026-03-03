// Document schemas
import siteSettings from "./documents/siteSettings";
import page from "./documents/page";
import project from "./documents/project";
import gameJam from "./documents/gameJam";
import testimonial from "./documents/testimonial";

// Block schemas (used inside page builder)
import heroBanner from "./blocks/heroBanner";
import portfolioGrid from "./blocks/portfolioGrid";
import gameJamsGrid from "./blocks/gameJamsGrid";
import aboutTimeline from "./blocks/aboutTimeline";
import videoShowreel from "./blocks/videoShowreel";
import testimonials from "./blocks/testimonials";
import richTextBlock from "./blocks/richTextBlock";

export const schemaTypes = [
  // Documents
  siteSettings,
  page,
  project,
  gameJam,
  testimonial,

  // Blocks
  heroBanner,
  portfolioGrid,
  gameJamsGrid,
  aboutTimeline,
  videoShowreel,
  testimonials,
  richTextBlock,
];
