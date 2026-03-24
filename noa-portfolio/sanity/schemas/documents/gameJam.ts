import { defineType, defineField } from "sanity";

export default defineType({
  name: "gameJam",
  title: "Game",
  type: "document",
  icon: () => "🎮",
  fieldsets: [
    {
      name: "core",
      title: "📋  Core Info",
      description: "Title, description, thumbnail, and your role — shown on the card.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "details",
      title: "🏷️  Event Details",
      description: "Jam name, award, date, team size, platform, and software.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "links",
      title: "🔗  Links",
      description: "Where people can play or watch the game.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ── Core Info ─────────────────────────────────────────────────
    defineField({
      name: "gameTitle",
      title: "Game Title",
      type: "string",
      fieldset: "core",
      validation: (Rule) => Rule.required().error("Please enter the game title."),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      fieldset: "core",
      options: { source: "gameTitle", maxLength: 96 },
      description: "Auto-generated from the title. Used for the game detail page URL.",
      validation: (Rule) => Rule.required().error("A slug is required for the detail page."),
    }),
    defineField({
      name: "thumbnail",
      title: "Screenshot / Thumbnail",
      type: "image",
      fieldset: "core",
      options: { hotspot: true },
      description: "Use the hotspot tool to set the focal point so the most important part stays visible.",
      fields: [
        { name: "alt", title: "Alt Text", type: "string", description: "Briefly describe the image." },
      ],
    }),
    defineField({
      name: "description",
      title: "Short Description (homepage card)",
      type: "text",
      rows: 3,
      fieldset: "core",
      description: "1–2 sentences about the game and your contribution. Shown on the card.",
    }),
    defineField({
      name: "detailDescription",
      title: "Detail Page Description",
      type: "text",
      rows: 6,
      fieldset: "core",
      description: "Shown on the game detail page. Can be longer. Falls back to the card description if left blank.",
    }),
    defineField({
      name: "role",
      title: "Your Role",
      type: "string",
      fieldset: "core",
      description: "e.g., Gameplay Animator, Animator / Rigger, Lead Animator, Solo Developer.",
    }),
    defineField({
      name: "genre",
      title: "Genre",
      type: "string",
      fieldset: "core",
      description: "e.g., Action, Puzzle, Platformer, RPG.",
    }),

    // ── Event Details ─────────────────────────────────────────────
    defineField({
      name: "jamName",
      title: "Game Jam Name",
      type: "string",
      fieldset: "details",
      description: "Leave blank if this isn't a jam game. e.g., Ludum Dare 56, GMTK Jam 2024, Jamsepticeye.",
    }),
    defineField({
      name: "placement",
      title: "Award / Placement",
      type: "string",
      fieldset: "details",
      description: 'e.g., "Top 5%", "Best Animation", "Community Pick", "Nominated at The BGA".',
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "string",
      fieldset: "details",
      description: "e.g., Oct 2024, 04 Oct – 06 Oct 2025.",
    }),
    defineField({
      name: "teamSize",
      title: "Team Size",
      type: "string",
      fieldset: "details",
      description: 'e.g., "Solo", "3", "6".',
    }),
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      fieldset: "details",
      description: "e.g., PC Windows, Web, PC Windows / Available on Steam.",
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
      description: "The icons for these will appear on the game card.",
    }),

    // ── Links ─────────────────────────────────────────────────────
    defineField({
      name: "playLink",
      title: "Play / Download Link",
      type: "url",
      fieldset: "links",
      description: "Link where people can play or download the game — e.g., itch.io, Steam.",
    }),
    defineField({
      name: "videoLink",
      title: "Trailer / Gameplay Video",
      type: "url",
      fieldset: "links",
      description: "YouTube or Vimeo link to a trailer or gameplay footage.",
    }),
  ],
  preview: {
    select: { title: "gameTitle", subtitle: "jamName", media: "thumbnail", role: "role" },
    prepare({ title, subtitle, media, role }) {
      return {
        title,
        subtitle: subtitle ? `${subtitle}${role ? " · " + role : ""}` : role || "",
        media,
      };
    },
  },
});
