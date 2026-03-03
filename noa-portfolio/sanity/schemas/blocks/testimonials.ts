import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "object",
  icon: () => "💬",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      initialValue: "What people say",
    }),
    defineField({
      name: "quotes",
      title: "Testimonials",
      type: "array",
      of: [{ type: "reference", to: [{ type: "testimonial" }] }],
      description: "Select testimonials to display (drag to reorder)",
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }) {
      return { title: title || "Testimonials", subtitle: "💬 Quotes" };
    },
  },
});
