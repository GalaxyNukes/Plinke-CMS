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
          videoFile {
            asset-> { _id, url, mimeType }
          }
        },
        heroRightVideo {
          ...,
          videoFile {
            asset-> { _id, url, mimeType }
          }
        },
        hero3dModel {
          ...,
          modelFile {
            asset-> { _id, url, mimeType }
          }
        }
      },
      _type == "portfolioGrid" => {
        ...,
        projects[]->{
          _id,
          title,
          slug,
          description,
          thumbnail,
          video {
            ...,
            videoFile {
              asset-> { _id, url, mimeType }
            }
          },
          projectType,
          projectGroup->{ _id, name },
          categories,
          year,
          projectLink,
          software,
          caseStudyContent
        }
      },
      _type == "gameJamsGrid" => {
        ...,
        jams[]->{
          _id,
          gameTitle,
          description,
          thumbnail,
          genre,
          platform,
          role,
          jamName,
          placement,
          date,
          teamSize,
          playLink,
          videoLink
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
      },
      _type == "videoShowreel" => {
        ...,
        videoSource {
          ...,
          videoFile {
            asset-> { _id, url, mimeType }
          }
        }
      },
      _type == "contactBlock" => {
        ...,
        cvFile {
          asset-> { _id, url, originalFilename }
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

// Fetch all projects
export const allProjectsQuery = groq`
  *[_type == "project"] | order(year desc){
    _id,
    title,
    slug,
    description,
    thumbnail,
    video {
      ...,
      videoFile {
        asset-> { _id, url, mimeType }
      }
    },
    projectType,
          projectGroup->{ _id, name },
    categories,
    year,
    projectLink,
    caseStudyContent
  }
`;

// Fetch single project by slug
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    description,
    thumbnail,
    video {
      ...,
      videoFile {
        asset-> { _id, url, mimeType }
      }
    },
    projectType,
          projectGroup->{ _id, name },
    categories,
    year,
    projectLink,
    caseStudyContent
  }
`;

// Fetch all project slugs + titles (for prev/next navigation)
export const allProjectSlugsQuery = groq`
  *[_type == "project"] | order(year desc, title asc){
    _id,
    title,
    slug,
    thumbnail
  }
`;

// Fetch all game jams
export const allGameJamsQuery = groq`
  *[_type == "gameJam"] | order(date desc){
    _id,
    gameTitle,
    description,
    thumbnail,
    genre,
    platform,
    role,
    jamName,
    placement,
    date,
    teamSize,
    playLink,
    videoLink
  }
`;

// Fetch all project groups (for portfolio filter dropdown)
export const allProjectGroupsQuery = groq`
  *[_type == "projectGroup"] | order(name asc){
    _id,
    name
  }
`;
