import { defineType, defineField } from "sanity";

export default defineType({
  name: "richTextBlock",
  title: "Rich Text Block",
  type: "object",
  icon: () => "📝",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title (optional)",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
      description: "Rich text — supports headings, bold, italic, links, images, lists",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
        layout: "radio",
      },
      initialValue: "light",
    }),
    defineField({
      name: "maxWidth",
      title: "Content Width",
      type: "string",
      options: {
        list: [
          { title: "Narrow (640px)", value: "narrow" },
          { title: "Medium (860px)", value: "medium" },
          { title: "Full Width", value: "full" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }) {
      return { title: title || "Rich Text Block", subtitle: "📝 Custom Content" };
    },
  },
});
