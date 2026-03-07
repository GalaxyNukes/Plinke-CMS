import { defineType, defineField } from "sanity";

export default defineType({
  name: "gameJamsGrid",
  title: "Games Grid",
  type: "object",
  icon: () => "🎮",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      initialValue: "Games",
    }),
    defineField({
      name: "jams",
      title: "Games",
      type: "array",
      of: [{ type: "reference", to: [{ type: "gameJam" }] }],
      description: "Select which games to show (drag to reorder)",
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }) {
      return { title: title || "Games", subtitle: "🎮 Games Grid" };
    },
  },
});
