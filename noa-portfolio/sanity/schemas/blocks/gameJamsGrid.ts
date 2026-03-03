import { defineType, defineField } from "sanity";

export default defineType({
  name: "gameJamsGrid",
  title: "Game Jams Grid",
  type: "object",
  icon: () => "🎮",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      initialValue: "Game Jams",
    }),
    defineField({
      name: "jams",
      title: "Game Jams",
      type: "array",
      of: [{ type: "reference", to: [{ type: "gameJam" }] }],
      description: "Select which game jams to show (drag to reorder)",
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }) {
      return { title: title || "Game Jams", subtitle: "🎮 Jam Entries" };
    },
  },
});
