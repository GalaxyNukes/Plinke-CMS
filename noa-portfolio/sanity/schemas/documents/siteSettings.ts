import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: () => "⚙️",
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      initialValue: "Noa Plinke",
      validation: (Rule) => Rule.required().error("Please enter your site name"),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Optional — if empty, the site name text will be used as the logo",
      options: { hotspot: true },
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "Animation that hits different",
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      validation: (Rule) => Rule.required().error("Please add your email address"),
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", title: "Platform", type: "string",
              options: {
                list: [
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "ArtStation", value: "artstation" },
                  { title: "YouTube", value: "youtube" },
                  { title: "Twitter / X", value: "twitter" },
                  { title: "itch.io", value: "itchio" },
                  { title: "GitHub", value: "github" },
                  { title: "Instagram", value: "instagram" },
                  { title: "Vimeo", value: "vimeo" },
                ],
              },
            },
            { name: "url", title: "Profile URL", type: "url" },
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "navLinks",
      title: "Navigation Links",
      description: "The links shown in the top navigation bar",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "href", title: "Link (e.g., #portfolio or /about)", type: "string" },
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
    defineField({
      name: "projectCategories",
      title: "Project Categories",
      description: "Manage the filter categories for your portfolio (e.g., Procedural Animation, Keyframe Animation)",
      type: "array",
      of: [{ type: "string" }],
      initialValue: ["Procedural Animation", "Keyframe Animation", "Motion Capture"],
    }),
    defineField({
      name: "theme",
      title: "Theme Colors",
      type: "object",
      description: "Customize the site's color palette",
      fields: [
        { name: "bgDark", title: "Dark Background", type: "color", description: "Hero & footer (default: #0e0e10)" },
        { name: "bgLight", title: "Light Background", type: "color", description: "Content sections (default: #f8f8f6)" },
        { name: "accent", title: "Accent Color", type: "color", description: "Primary accent (default: #c9fb00 lime)" },
        { name: "accentSecondary", title: "Secondary Accent", type: "color", description: "Secondary accent (default: #7b61ff purple)" },
      ],
    }),
    defineField({
      name: "footerText",
      title: "Footer Heading",
      type: "string",
      initialValue: "Let's make something awesome",
    }),
    defineField({
      name: "copyright",
      title: "Copyright Text",
      type: "string",
      initialValue: "© 2025 Noa Plinke",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
