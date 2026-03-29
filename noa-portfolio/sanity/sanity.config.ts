import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
import { schemaTypes } from "./schemas";
import {
  BookOpen,
  Briefcase,
  Gamepad2,
  MessageSquare,
  Settings,
} from "lucide-react";

// Custom desk structure for beginner-friendly sidebar
const deskStructure = (S: any) =>
  S.list()
    .title("Content")
    .items([
      // 📄 Pages
      S.listItem()
        .title("Pages")
        .icon(() => "📄")
        .child(S.documentTypeList("page").title("Pages")),

      S.divider(),

      // 🎨 Portfolio Projects
      S.listItem()
        .title("Portfolio Projects")
        .icon(() => "🎨")
        .child(S.documentTypeList("project").title("Portfolio Projects")),

      // 📁 Project Groups
      S.listItem()
        .title("Project Groups")
        .icon(() => "📁")
        .child(S.documentTypeList("projectGroup").title("Project Groups")),

      // 🎮 Games
      S.listItem()
        .title("Games")
        .icon(() => "🎮")
        .child(S.documentTypeList("gameJam").title("Games")),

      // 💬 Testimonials
      S.listItem()
        .title("Testimonials")
        .icon(() => "💬")
        .child(S.documentTypeList("testimonial").title("Testimonials")),

      S.divider(),

      // ⚙️ Site Settings (singleton)
      S.listItem()
        .title("Site Settings")
        .icon(() => "⚙️")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings")
        ),
    ]);

export default defineConfig({
  name: "noa-portfolio",
  title: "Noa Plinke — Portfolio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  basePath: "/studio",

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
    colorInput(),
  ],

  schema: {
    types: schemaTypes,
  },

});
