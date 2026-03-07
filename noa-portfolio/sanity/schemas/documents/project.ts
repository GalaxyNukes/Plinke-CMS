import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Portfolio Project",
  type: "document",
  icon: () => "🎨",
  fields: [
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      validation: (Rule) => Rule.required().error("Every project needs a title!"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(250).warning("Keep it short and punchy — under 250 characters"),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error("Please upload a thumbnail for this project"),
      fields: [
        { name: "alt", title: "Alt Text", type: "string", description: "Describe the image for accessibility" },
      ],
    }),
    defineField({
      name: "video",
      title: "Project Video (optional)",
      type: "object",
      description: "Upload a video file OR paste a YouTube/Vimeo URL",
      fields: [
        { name: "videoFile", title: "Upload Video File", type: "file",
          options: { accept: "video/mp4,video/webm" },
          description: "MP4 or WebM format" },
        { name: "embedUrl", title: "Or Paste YouTube/Vimeo URL", type: "url",
          description: "e.g., https://www.youtube.com/watch?v=..." },
      ],
    }),
    defineField({
      name: "projectType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Project", value: "Project" },
          { title: "Demoreel", value: "Demoreel" },
        ],
        layout: "radio",
      },
      initialValue: "Project",
      description: "Is this a full project or a demoreel?",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Procedural Animation", value: "Procedural Animation" },
          { title: "Keyframe Animation", value: "Keyframe Animation" },
          { title: "Motion Capture", value: "Motion Capture" },
        ],
      },
      description: "Select one or more categories (manage the list in Site Settings)",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      initialValue: new Date().getFullYear().toString(),
    }),
    defineField({
      name: "projectLink",
      title: "Project Link (optional)",
      type: "url",
      description: "Link to live project, demo, or case study",
    }),
    defineField({
      name: "caseStudyContent",
      title: "Case Study (optional)",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      description: "Detailed write-up — for a future project detail page",
    }),
  ],
  preview: {
    select: { title: "title", media: "thumbnail", year: "year" },
    prepare({ title, media, year }) {
      return {
        title,
        subtitle: year || "",
        media,
      };
    },
  },
});
