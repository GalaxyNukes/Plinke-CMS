import { defineType, defineField } from "sanity";

export default defineType({
  name: "aboutTimeline",
  title: "About + Timeline",
  type: "object",
  icon: () => "👤",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      initialValue: "About",
    }),
    defineField({
      name: "profilePhoto",
      title: "Profile Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
      ],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Your bio — supports bold, italic, links",
    }),
    defineField({
      name: "tools",
      title: "Tools & Software",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g., Unreal Engine, Maya, Blender",
    }),
    defineField({
      name: "timeline",
      title: "Experience Timeline",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "period", title: "Time Period", type: "string",
              description: 'e.g., "2024 — Present"' },
            { name: "role", title: "Role", type: "string" },
            { name: "company", title: "Company / Studio", type: "string" },
            { name: "description", title: "Short Description (homepage)", type: "text", rows: 2,
              description: "Shown on the homepage timeline card." },
            { name: "detailDescription", title: "Detail Description", type: "text", rows: 4,
              description: "Longer description for a dedicated detail page. Falls back to short description if blank." },
          ],
          preview: {
            select: { title: "role", subtitle: "company" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }) {
      return { title: title || "About + Timeline", subtitle: "👤 Bio & Experience" };
    },
  },
});
