import { defineType, defineField } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: () => "📄",
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
      title: "Page Blocks",
      description: "Add, remove, and reorder sections to build your page",
      type: "array",
      of: [
        { type: "heroBanner" },
        { type: "portfolioGrid" },
        { type: "gameJamsGrid" },
        { type: "aboutTimeline" },
        { type: "videoShowreel" },
        { type: "testimonials" },
        { type: "richTextBlock" },
        { type: "contactBlock" },
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
