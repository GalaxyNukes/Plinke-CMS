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
      name: "cvFile",
      title: "CV / Resume File (optional)",
      type: "file",
      description: "Upload a PDF — shows a 'Download CV' button next to the email button",
      options: { accept: ".pdf,.doc,.docx" },
    }),
    defineField({
      name: "cvLabel",
      title: "CV Button Label",
      type: "string",
      initialValue: "Download CV",
      description: "Label for the CV download button",
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
