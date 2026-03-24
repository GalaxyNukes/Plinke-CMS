import { defineType, defineField } from "sanity";

export default defineType({
  name: "aboutTimeline",
  title: "About + Timeline",
  type: "object",
  icon: () => "👤",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      initialValue: "About",
    }),
    defineField({
      name: "profilePhoto",
      title: "Profile Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
      ],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Your bio — supports bold, italic, links",
    }),
    defineField({
      name: "tools",
      title: "Tools & Software",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g., Unreal Engine, Maya, Blender",
    }),
    defineField({
      name: "timeline",
      title: "Experience Timeline",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "period", title: "Time Period", type: "string",
              description: 'e.g., "2024 — Present"' },
            { name: "role", title: "Role", type: "string" },
            { name: "company", title: "Company / Studio", type: "string" },
            {
              name: "slug",
              title: "URL Slug",
              type: "slug",
              description: "Used for the experience detail page URL. Generate from the role name.",
              options: { source: "role", maxLength: 96 },
            },
            { name: "location", title: "Location", type: "string",
              description: 'e.g., "Amsterdam, NL" or "Remote"' },
            {
              name: "thumbnail",
              title: "Thumbnail / Company Logo",
              type: "image",
              options: { hotspot: true },
              fields: [{ name: "alt", title: "Alt Text", type: "string" }],
            },
            { name: "description", title: "Short Description (homepage)", type: "text", rows: 2,
              description: "Shown on the homepage timeline card." },
            { name: "detailDescription", title: "Detail Description", type: "text", rows: 4,
              description: "Longer description for the detail page. Falls back to short description if blank." },
            {
              name: "highlights",
              title: "Key Highlights",
              type: "array",
              of: [{ type: "string" }],
              description: 'Bullet points shown on the detail page — e.g. "Shipped 3 AAA titles"',
            },
            {
              name: "software",
              title: "Software Used",
              type: "array",
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
                  { title: "Perforce", value: "perforce" },
                  { title: "Git", value: "git" },
                ],
                layout: "grid",
              },
            },
          ],
          preview: {
            select: { title: "role", subtitle: "company", media: "thumbnail" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }: any) {
      return { title: title || "About + Timeline", subtitle: "👤 Bio & Experience" };
    },
  },
});
