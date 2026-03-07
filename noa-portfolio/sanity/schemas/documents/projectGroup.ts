import { defineType, defineField } from "sanity";

export default defineType({
  name: "projectGroup",
  title: "Project Group",
  type: "document",
  icon: () => "📁",
  fields: [
    defineField({
      name: "name",
      title: "Project / Game Name",
      type: "string",
      validation: (Rule) => Rule.required().error("Please enter a name"),
      description: "e.g., Hunting Simulator, Baldur's Gate, Personal Project",
    }),
    defineField({
      name: "thumbnail",
      title: "Cover Image (optional)",
      type: "image",
      options: { hotspot: true },
      description: "Optional image shown in the filter dropdown",
    }),
  ],
  preview: {
    select: { title: "name", media: "thumbnail" },
    prepare({ title, media }) {
      return {
        title: title || "Untitled Group",
        subtitle: "📁 Project Group",
        media,
      };
    },
  },
});
