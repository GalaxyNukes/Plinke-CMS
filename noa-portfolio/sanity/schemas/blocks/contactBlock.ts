import { defineType, defineField } from "sanity";

export default defineType({
  name: "contactBlock",
  title: "Contact / CTA Block",
  type: "object",
  icon: () => "✉️",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Let's make something awesome",
      validation: (Rule) => Rule.required().error("Please add a heading"),
    }),
    defineField({
      name: "ctaLabel",
      title: "Button Label",
      type: "string",
      initialValue: "Send me an email",
    }),
    defineField({
      name: "ctaLink",
      title: "Button Link",
      type: "string",
      initialValue: "mailto:hello@noaplinke.com",
      description: "Use mailto:your@email.com for email, or any URL",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background",
      type: "string",
      options: {
        list: [
          { title: "Dark", value: "dark" },
          { title: "Light", value: "light" },
        ],
        layout: "radio",
      },
      initialValue: "dark",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Contact Block", subtitle: "✉️ CTA Section" };
    },
  },
});
