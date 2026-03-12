import { defineType, defineField } from "sanity";

export default defineType({
  name: "gameJam",
  title: "Game",
  type: "document",
  icon: () => "🎮",
  fields: [
    defineField({
      name: "gameTitle",
      title: "Game Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "thumbnail",
      title: "Screenshot / Thumbnail",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
      ],
    }),
    defineField({
      name: "genre",
      title: "Genre / Type",
      type: "string",
      description: "e.g., Action, Puzzle, Platformer, RPG",
    }),
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      description: "e.g., PC, Web, Mobile, Console",
    }),
    defineField({
      name: "role",
      title: "Your Role",
      type: "string",
      description: "e.g., Gameplay Animator, Lead Animator, Solo Developer",
    }),
    defineField({
      name: "jamName",
      title: "Game Jam Name (optional)",
      type: "string",
      description: "If this was made for a game jam, e.g., Ludum Dare 56, GMTK Jam 2024",
    }),
    defineField({
      name: "placement",
      title: "Award / Placement (optional)",
      type: "string",
      description: 'e.g., "Top 5%", "Best Animation", "Community Pick"',
    }),
    defineField({
      name: "date",
      title: "Date / Year",
      type: "string",
      description: "e.g., Oct 2024, 2023",
    }),
    defineField({
      name: "teamSize",
      title: "Team Size",
      type: "string",
      description: 'e.g., "Solo", "3", "4"',
    }),
    defineField({
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
          { title: "Cinema 4D", value: "cinema4d" },
          { title: "ZBrush", value: "zbrush" },
          { title: "Substance Painter", value: "substance" },
          { title: "Perforce", value: "perforce" },
          { title: "Git", value: "git" },
        ],
        layout: "grid",
      },
      description: "Which software was used to create this game?",
    }),
    defineField({
      name: "playLink",
      title: "Play / Download Link",
      type: "url",
      description: "Link to play or download the game (e.g., itch.io, Steam)",
    }),
    defineField({
      name: "videoLink",
      title: "Trailer / Gameplay Video (optional)",
      type: "url",
      description: "YouTube or Vimeo link to gameplay footage or trailer",
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
