import { defineType, defineField } from "sanity";

export default defineType({
  name: "portfolioGrid",
  title: "Portfolio Grid",
  type: "object",
  icon: () => "📂",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      initialValue: "Portfolio",
    }),
    defineField({
      name: "showFilters",
      title: "Show Category Filters",
      type: "boolean",
      initialValue: true,
      description: "Toggle the filter buttons above the grid",
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description: "Select which projects to show (drag to reorder)",
      validation: (Rule) => Rule.min(1).error("Please add at least one project"),
    }),
    defineField({
      name: "viewAllLink",
      title: "View All Link (optional)",
      type: "string",
      description: "URL for the 'View All' button. Leave empty to hide.",
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare({ title }) {
      return { title: title || "Portfolio Grid", subtitle: "📂 Project Gallery" };
    },
  },
});
