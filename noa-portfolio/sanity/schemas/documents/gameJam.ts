import { defineType, defineField } from "sanity";

export default defineType({
  name: "gameJam",
  title: "Game Jam",
  type: "document",
  icon: () => "🎮",
  fields: [
    defineField({
      name: "jamName",
      title: "Jam Name",
      type: "string",
      description: "e.g., Ludum Dare 56, GMTK Jam 2024",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gameTitle",
      title: "Game Title",
      type: "string",
      validation: (Rule) => Rule.required(),
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
      name: "placement",
      title: "Placement / Result",
      type: "string",
      description: 'e.g., "Top 5%", "Best Animation", "Community Pick"',
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "string",
      description: "e.g., Oct 2024",
    }),
    defineField({
      name: "teamSize",
      title: "Team Size",
      type: "string",
      description: 'e.g., "Solo", "3", "4"',
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "playLink",
      title: "Play Link",
      type: "url",
      description: "Link to play the game (e.g., itch.io)",
    }),
  ],
  preview: {
    select: { title: "gameTitle", subtitle: "jamName", media: "thumbnail" },
  },
});
