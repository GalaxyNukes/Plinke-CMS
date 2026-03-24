import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Portfolio Project",
  type: "document",
  icon: () => "🎨",
  fieldsets: [
    {
      name: "core",
      title: "📋  Core Info",
      description: "Title, description, thumbnail, and category — the essentials that show on the card.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "media",
      title: "🎬  Media",
      description: "Video for the project detail page.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "details",
      title: "🔧  Details",
      description: "Year, software used, project link, and optional case study content.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ── Core Info ─────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      fieldset: "core",
      validation: (Rule) => Rule.required().error("Every project needs a title!"),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      fieldset: "core",
      description: "Auto-generated from the title. Used in the project page URL.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      fieldset: "core",
      options: { hotspot: true },
      description: "The image shown on the portfolio card. Use the hotspot tool to set the focal point so nothing gets cropped out.",
      validation: (Rule) => Rule.required().error("Please upload a thumbnail for this project."),
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Briefly describe the image — used for accessibility and SEO.",
        },
      ],
    }),
    defineField({
      name: "description",
      title: "Short Description (homepage card)",
      type: "text",
      rows: 3,
      fieldset: "core",
      description: "Shown on the homepage portfolio card. Keep it to 1–2 punchy sentences.",
      validation: (Rule) => Rule.max(300).warning("Try to keep descriptions under 300 characters for best display."),
    }),
    defineField({
      name: "detailDescription",
      title: "Detail Page Description",
      type: "text",
      rows: 6,
      fieldset: "core",
      description: "Shown on the project detail page. Can be longer and more descriptive than the card description. Falls back to the card description if left blank.",
    }),
    defineField({
      name: "projectType",
      title: "Type",
      type: "string",
      fieldset: "core",
      description: "Is this a standalone project or a demoreel?",
      options: {
        list: [
          { title: "Project", value: "Project" },
          { title: "Demoreel", value: "Demoreel" },
        ],
        layout: "radio",
      },
      initialValue: "Project",
    }),
    defineField({
      name: "projectGroup",
      title: "Game / Project it belongs to",
      type: "reference",
      fieldset: "core",
      to: [{ type: "projectGroup" }],
      description: "If this animation is part of a larger game or project, link it here. You can create a new one on the fly.",
      hidden: ({ parent }: any) => parent?.projectType !== "Project",
      options: { disableNew: false },
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      fieldset: "core",
      of: [{ type: "string" }],
      description: "Used for the portfolio filter. Type any category — match the names you've set in Site Settings → Portfolio Filter Categories.",
    }),

    // ── Media ──────────────────────────────────────────────────────
    defineField({
      name: "video",
      title: "Project Video",
      type: "object",
      fieldset: "media",
      description: "Shown on the project detail page. Upload a file OR paste a YouTube/Vimeo URL — not both.",
      fields: [
        {
          name: "videoFile",
          title: "Upload a video file (mp4 / webm)",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
          description: "MP4 or WebM. Hosted directly on Sanity.",
        },
        {
          name: "embedUrl",
          title: "Or paste a YouTube / Vimeo URL",
          type: "url",
          description: "e.g., https://www.youtube.com/watch?v=...",
        },
      ],
    }),

    // ── Details ───────────────────────────────────────────────────
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      fieldset: "details",
      description: "The year this project was completed.",
      initialValue: new Date().getFullYear().toString(),
    }),
    defineField({
      name: "software",
      title: "Software Used",
      type: "array",
      fieldset: "details",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Maya", value: "maya" },
          { title: "Unreal Engine", value: "unreal" },
          { title: "Unity", value: "unity" },
          { title: "Blender", value: "blender" },
          { title: "MotionBuilder", value: "motionbuilder" },
          { title: "Houdini", value: "houdini" },
          { title: "3ds Max", value: "3dsmax" },
          { title: "Cinema 4D", value: "cinema4d" },
          { title: "ZBrush", value: "zbrush" },
          { title: "Substance Painter", value: "substance" },
          { title: "Perforce", value: "perforce" },
          { title: "Git", value: "git" },
        ],
        layout: "grid",
      },
      description: "The icons for these will appear on the card and detail page.",
    }),
    defineField({
      name: "projectLink",
      title: "External Link",
      type: "url",
      fieldset: "details",
      description: "Optional. Link to a live demo, game page, or related URL.",
    }),
    defineField({
      name: "caseStudyContent",
      title: "Case Study (optional)",
      type: "array",
      fieldset: "details",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      description: "A detailed write-up with images. Shown below the video on the project detail page.",
    }),
  ],
  preview: {
    select: { title: "title", media: "thumbnail", year: "year" },
    prepare({ title, media, year }) {
      return { title, subtitle: year || "", media };
    },
  },
});
