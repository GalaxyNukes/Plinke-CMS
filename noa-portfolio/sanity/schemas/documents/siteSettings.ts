import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: () => "⚙️",
  // Field groups create tabs — keeps the settings panel clean instead of one long scroll
  groups: [
    { name: "identity", title: "👤  Identity", default: true },
    { name: "navigation", title: "🔗  Navigation" },
    { name: "theme", title: "🎨  Theme & Colours" },
    { name: "footer", title: "📄  Footer" },
  ],
  fields: [
    // ── Identity ──────────────────────────────────────────────────
    defineField({
      name: "siteName",
      title: "Your Name",
      type: "string",
      group: "identity",
      initialValue: "Noa Plinke",
      description: "Used as the site title and in search results.",
      validation: (Rule) => Rule.required().error("Please enter your name."),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "identity",
      initialValue: "Animation that hits different",
      description: "A short phrase that describes you — shown in browser tab titles.",
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
      rows: 3,
      group: "identity",
      initialValue: "Portfolio of Noa Plinke, a 3D Gameplay Animator specializing in combat systems, procedural motion, and game development.",
      description: "The description shown in Google search results, link previews (WhatsApp, Messenger, LinkedIn, Discord etc.), and browser tooltips. Keep it to 1–2 sentences, ideally under 160 characters.",
      validation: (Rule) => Rule.max(300).warning("Over 160 characters may get cut off in search results."),
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      group: "identity",
      description: "Used in the contact button and footer. e.g., hello@noaplinke.com.",
      validation: (Rule) => Rule.required().error("Please add your email address."),
    }),
    defineField({
      name: "logo",
      title: "Logo Image",
      type: "image",
      group: "identity",
      description: "Optional. If left empty, your name is shown as text in the navbar.",
      options: { hotspot: true },
    }),
    defineField({
      name: "ogImage",
      title: "Social Share Image (OG Image)",
      type: "image",
      group: "identity",
      description: "The image shown when someone shares your site on LinkedIn, Twitter, Discord, etc. Ideal size: 1200×630px. If left empty, an auto-generated branded image is used.",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt Text", type: "string", description: "Describe the image." },
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      group: "identity",
      description: "Your social media profiles. Shown in the footer.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
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

    // ── Navigation ────────────────────────────────────────────────
    defineField({
      name: "navLinks",
      title: "Navigation Links",
      type: "array",
      group: "navigation",
      description: "The links shown in the top navigation bar. Drag to reorder.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string", description: "The text shown in the nav, e.g., 'Portfolio'." },
            { name: "href", title: "Link", type: "string", description: "e.g., #portfolio (same-page anchor) or /about (separate page)." },
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
    defineField({
      name: "projectCategories",
      title: "Portfolio Filter Categories",
      type: "array",
      group: "navigation",
      of: [{ type: "string" }],
      description: "The filter options shown above the portfolio grid. Add or remove categories here.",
      initialValue: ["Procedural Animation", "Keyframe Animation", "Motion Capture"],
    }),

    // ── Theme & Colours ───────────────────────────────────────────
    defineField({
      name: "theme",
      title: "Colour Palette",
      type: "object",
      group: "theme",
      description: "Changes the colour scheme across the entire site. The defaults are dark/lime/purple.",
      fields: [
        {
          name: "bgDark",
          title: "Dark Background",
          type: "color",
          description: "Used for the hero, footer, and dark sections. Default: #0e0e10.",
        },
        {
          name: "bgLight",
          title: "Light Background",
          type: "color",
          description: "Used for portfolio, games, and about sections. Default: #f8f8f6.",
        },
        {
          name: "accent",
          title: "Primary Accent",
          type: "color",
          description: "The main highlight colour — buttons, tags, hover states. Default: #c9fb00 (lime).",
        },
        {
          name: "accentSecondary",
          title: "Secondary Accent",
          type: "color",
          description: "Used for category labels, links, and decorative details. Default: #7b61ff (purple).",
        },
      ],
    }),

    // ── Footer ────────────────────────────────────────────────────
    defineField({
      name: "footerText",
      title: "Footer Heading",
      type: "string",
      group: "footer",
      initialValue: "Let's make something awesome",
      description: "The big heading shown above your email in the footer.",
    }),
    defineField({
      name: "copyright",
      title: "Copyright Text",
      type: "string",
      group: "footer",
      initialValue: "© 2025 Noa Plinke",
      description: "Shown at the very bottom of the site.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
