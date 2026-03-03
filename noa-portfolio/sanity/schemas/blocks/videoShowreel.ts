import { defineType, defineField } from "sanity";

export default defineType({
  name: "videoShowreel",
  title: "Video Showreel",
  type: "object",
  icon: () => "🎥",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title (optional)",
      type: "string",
    }),
    defineField({
      name: "videoSource",
      title: "Video Source",
      type: "object",
      fields: [
        {
          name: "type",
          title: "Video Type",
          type: "string",
          options: {
            list: [
              { title: "Upload (MP4/WebM)", value: "upload" },
              { title: "YouTube", value: "youtube" },
              { title: "Vimeo", value: "vimeo" },
            ],
            layout: "radio",
          },
          initialValue: "youtube",
        },
        {
          name: "videoFile",
          title: "Upload Video File",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
          description: "Only used if type is 'Upload'",
          hidden: ({ parent }: any) => parent?.type !== "upload",
        },
        {
          name: "embedUrl",
          title: "Video URL",
          type: "url",
          description: "YouTube or Vimeo link",
          hidden: ({ parent }: any) => parent?.type === "upload",
        },
      ],
    }),
    defineField({
      name: "posterImage",
      title: "Poster / Thumbnail",
      type: "image",
      description: "Shown before the video plays",
      options: { hotspot: true },
    }),
    defineField({
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "caption",
      title: "Caption (optional)",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "sectionTitle", type: "videoSource.type" },
    prepare({ title, type }) {
      return {
        title: title || "Video Showreel",
        subtitle: `🎥 ${type || "video"} embed`,
      };
    },
  },
});
