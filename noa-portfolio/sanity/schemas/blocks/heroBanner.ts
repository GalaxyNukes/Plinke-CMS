import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroBanner",
  title: "Hero Banner",
  type: "object",
  icon: () => "🎬",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Animation that hits different",
      validation: (Rule) => Rule.required().error("Please add a heading for your hero section"),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
      ],
    }),
    defineField({
      name: "heroVideo",
      title: "Hero Video (optional)",
      type: "object",
      description: "Upload a video or paste a URL — shows on click of the play badge",
      fields: [
        { name: "videoFile", title: "Upload Video File", type: "file",
          options: { accept: "video/mp4,video/webm" } },
        { name: "embedUrl", title: "Or Paste YouTube/Vimeo URL", type: "url" },
      ],
    }),
    defineField({
      name: "secondaryThumbnail",
      title: "Secondary Thumbnail",
      type: "image",
      description: "Small image shown in the bottom-right of the hero",
      options: { hotspot: true },
    }),
    defineField({
      name: "showPlayBadge",
      title: "Show Play Badge",
      type: "boolean",
      initialValue: true,
      description: 'The rotating "CLICK TO PLAY" circle on the hero image',
    }),
    defineField({
      name: "tags",
      title: "Specialty Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "The scattered pill tags (e.g., Gameplay Animation, Rigging)",
      initialValue: [
        "Gameplay Animation",
        "Game Development",
        "Engine Implementation",
        "Workflow Optimization",
        "Rigging",
        "Procedural Animations",
      ],
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA Button Label",
      type: "string",
      initialValue: "SEND ME AN EMAIL",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Button Link",
      type: "string",
      initialValue: "mailto:hello@noaplinke.com",
      description: "Use mailto:your@email.com for email, or a URL",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }) {
      return { title: title || "Hero Banner", subtitle: "🎬 Hero Section" };
    },
  },
});
