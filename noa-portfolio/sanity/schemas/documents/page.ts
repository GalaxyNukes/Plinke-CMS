import { defineType, defineField } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: () => "📄",
  description: "Add, remove, and reorder sections to build your page. Drag the handles to rearrange.",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "blocks",
      title: "Page Sections",
      description: "Drag to reorder. Click + to add a new section.",
      type: "array",
      of: [
        {
          type: "heroBanner",
          title: "Hero Banner",
          icon: () => "🎬",
        },
        {
          type: "portfolioGrid",
          title: "Portfolio Grid",
          icon: () => "🎨",
        },
        {
          type: "gameJamsGrid",
          title: "Games Section",
          icon: () => "🎮",
        },
        {
          type: "aboutTimeline",
          title: "About & Timeline",
          icon: () => "👤",
        },
        {
          type: "videoShowreel",
          title: "Video Showreel",
          icon: () => "▶️",
        },
        {
          type: "testimonials",
          title: "Testimonials",
          icon: () => "💬",
        },
        {
          type: "richTextBlock",
          title: "Text Block",
          icon: () => "📝",
        },
        {
          type: "contactBlock",
          title: "Contact",
          icon: () => "✉️",
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return {
        title: title || "Untitled Page",
        subtitle: `/${slug || ""}`,
      };
    },
  },
});
