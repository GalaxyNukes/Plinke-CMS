import { HeroBanner } from "./blocks/HeroBanner";
import { PortfolioGrid } from "./blocks/PortfolioGrid";
import { GameJamsGrid } from "./blocks/GameJamsGrid";
import { AboutTimeline } from "./blocks/AboutTimeline";
import { VideoShowreel } from "./blocks/VideoShowreel";
import { Testimonials } from "./blocks/Testimonials";
import { RichTextBlock } from "./blocks/RichTextBlock";

const blockComponents: Record<string, React.ComponentType<any>> = {
  heroBanner: HeroBanner,
  portfolioGrid: PortfolioGrid,
  gameJamsGrid: GameJamsGrid,
  aboutTimeline: AboutTimeline,
  videoShowreel: VideoShowreel,
  testimonials: Testimonials,
  richTextBlock: RichTextBlock,
};

interface BlockRendererProps {
  blocks: any[];
  settings?: any;
}

export function BlockRenderer({ blocks, settings }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block: any) => {
        const Component = blockComponents[block._type];
        if (!Component) return null;
        return <Component key={block._key} {...block} settings={settings} />;
      })}
    </>
  );
}
