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
      _type == "heroBanner" => {
        ...,
        heroVideo {
          ...,
          videoFile { asset-> { _id, url, mimeType } }
        },
        heroRightVideo {
          ...,
          videoFile { asset-> { _id, url, mimeType } }
        },
        hero3dModel {
          ...,
          modelFile { asset-> { _id, url, mimeType } }
        }
      },
      _type == "portfolioGrid" => {
        ...,
        projects[]->{
          _id, title, slug, description, detailDescription, thumbnail,
          video { ..., videoFile { asset-> { _id, url, mimeType } } },
          projectType, projectGroup->{ _id, name },
          categories, year, projectLink, software, caseStudyContent
        }
      },
      _type == "gameJamsGrid" => {
        ...,
        jams[]->{
          _id, gameTitle, slug, description, detailDescription, thumbnail,
          genre, platform, role, jamName, placement, date, teamSize,
          playLink, videoLink, software
        }
      },
      _type == "testimonials" => {
        ...,
        quotes[]->{ _id, quote, author, role, company, avatar }
      },
      _type == "videoShowreel" => {
        ...,
        videoSource { ..., videoFile { asset-> { _id, url, mimeType } } }
      },
      _type == "aboutTimeline" => {
        ...,
        timeline[]{
          ...,
          thumbnail
        }
      },
      _type == "contactBlock" => {
        ...,
        cvFile { asset-> { _id, url, originalFilename } }
      }
    }
  }
`;

// Fetch site settings (singleton)
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    siteName, logo, ogImage{ asset->{ url } }, tagline, siteDescription,
    email, socialLinks, navLinks, theme, footerText, copyright, projectCategories,
    displayFont{ family, weight, customName, customFile{ asset->{ url } } },
    bodyFont{ family, weight, customName, customFile{ asset->{ url } } }
  }
`;

// Fetch all projects
export const allProjectsQuery = groq`
  *[_type == "project"] | order(year desc){
    _id, title, slug, description, detailDescription, thumbnail,
    video { ..., videoFile { asset-> { _id, url, mimeType } } },
    projectType, projectGroup->{ _id, name },
    categories, year, projectLink, caseStudyContent
  }
`;

// Fetch single project by slug
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0]{
    _id, title, slug, description, detailDescription, thumbnail,
    video { ..., videoFile { asset-> { _id, url, mimeType } } },
    projectType, projectGroup->{ _id, name },
    categories, software, year, projectLink, caseStudyContent
  }
`;

// Fetch all project slugs in fallback order (year desc) — used only if homepage order unavailable
export const allProjectSlugsQuery = groq`
  *[_type == "project"] | order(year desc, title asc){
    _id, title, slug, thumbnail, projectType
  }
`;

// Homepage portfolioGrid order — canonical order for prev/next navigation on detail pages (task 5)
export const homepageProjectOrderQuery = groq`
  *[_type == "page" && slug.current == "home"][0]{
    "projects": blocks[_type == "portfolioGrid"][0].projects[]->{
      _id, title, slug, thumbnail, projectType
    }
  }.projects
`;

// Fetch single game jam by slug
export const gameJamBySlugQuery = groq`
  *[_type == "gameJam" && slug.current == $slug][0]{
    _id, gameTitle, slug, description, detailDescription, thumbnail,
    genre, platform, role, jamName, placement, date, teamSize,
    playLink, videoLink, software
  }
`;

// All game jam slugs (fallback order for static generation)
export const allGameJamSlugsQuery = groq`
  *[_type == "gameJam"] | order(date desc){ _id, gameTitle, slug, thumbnail }
`;

// Homepage gameJamsGrid order — canonical order for prev/next on game detail pages
export const homepageGameOrderQuery = groq`
  *[_type == "page" && slug.current == "home"][0]{
    "jams": blocks[_type == "gameJamsGrid"][0].jams[]->{
      _id, gameTitle, slug, thumbnail
    }
  }.jams
`;

// Fetch all game jams
export const allGameJamsQuery = groq`
  *[_type == "gameJam"] | order(date desc){
    _id, gameTitle, slug, description, detailDescription, thumbnail,
    genre, platform, role, jamName, placement, date, teamSize,
    playLink, videoLink, software
  }
`;

// Fetch all project groups (for portfolio filter dropdown)
export const allProjectGroupsQuery = groq`
  *[_type == "projectGroup"] | order(name asc){ _id, name }
`;

// Fetch all timeline entries from homepage aboutTimeline block (for static generation)
export const homepageTimelineEntriesQuery = groq`
  *[_type == "page" && slug.current == "home"][0]{
    "entries": blocks[_type == "aboutTimeline"][0].timeline[]{
      slug,
      period,
      role,
      company,
      location,
      thumbnail,
      description,
      detailDescription,
      highlights,
      software,
      "_key": _key
    }
  }.entries
`;
