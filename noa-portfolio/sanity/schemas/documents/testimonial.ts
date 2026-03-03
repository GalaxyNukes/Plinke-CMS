import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: () => "💬",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().error("Please add the testimonial quote"),
    }),
    defineField({
      name: "author",
      title: "Author Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      description: "e.g., Lead Animator, Creative Director",
    }),
    defineField({
      name: "company",
      title: "Company / Studio",
      type: "string",
    }),
    defineField({
      name: "avatar",
      title: "Photo (optional)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "author", subtitle: "company", media: "avatar" },
  },
});
