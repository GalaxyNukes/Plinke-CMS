import { groq } from "next-sanity";

// Fetch a page by slug with all blocks dereferenced
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0]{
    title,
    slug,
    blocks[]{
      _type,
      _key,
      ...,
      _type == "portfolioGrid" => {
        ...,
        projects[]->{
          _id,
          title,
          slug,
          description,
          thumbnail,
          video,
          categories,
          year,
          projectLink,
          caseStudyContent
        }
      },
      _type == "gameJamsGrid" => {
        ...,
        jams[]->{
          _id,
          jamName,
          gameTitle,
          thumbnail,
          placement,
          date,
          teamSize,
          description,
          playLink
        }
      },
      _type == "testimonials" => {
        ...,
        quotes[]->{
          _id,
          quote,
          author,
          role,
          company,
          avatar
        }
      }
    }
  }
`;

// Fetch site settings (singleton)
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    siteName,
    logo,
    tagline,
    email,
    socialLinks,
    navLinks,
    theme,
    footerText,
    copyright,
    projectCategories
  }
`;

// Fetch all projects (for a future "all projects" page)
export const allProjectsQuery = groq`
  *[_type == "project"] | order(year desc){
    _id,
    title,
    slug,
    description,
    thumbnail,
    categories,
    year,
    projectLink
  }
`;

// Fetch all game jams
export const allGameJamsQuery = groq`
  *[_type == "gameJam"] | order(date desc){
    _id,
    jamName,
    gameTitle,
    thumbnail,
    placement,
    date,
    teamSize,
    description,
    playLink
  }
`;
