# Noa Plinke — Portfolio CMS

A full portfolio website with a page-builder CMS backend.
Built with **Next.js 14 + Sanity v3 + Tailwind CSS**.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up Sanity
#    - Create a free account at https://sanity.io
#    - Create a project, copy your Project ID
#    - Edit .env.local with your Project ID

# 3. Run the dev server
npm run dev

# 4. Open your site: http://localhost:3000
# 5. Open the CMS: http://localhost:3000/studio
```

## First Time Setup

1. Visit `/studio` and log in with your Sanity account
2. Go to **Site Settings** → Fill in your name, email, social links, theme colors
3. Go to **Portfolio Projects** → Create your projects (5 recommended to start)
4. Go to **Game Jams** → Create your jam entries
5. Go to **Pages** → Create a new page:
   - Title: "Homepage"
   - Slug: "home" (click Generate)
   - Add blocks: Hero Banner → Portfolio Grid → Game Jams → About → etc.
6. Hit **Publish** on everything

## Deploy to Vercel (Free)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION` = `2024-01-01`
4. Click Deploy
5. Your CMS is at `your-site.vercel.app/studio`

## Connect a Custom Domain

1. Buy a domain from [Porkbun](https://porkbun.com) (~$10/year)
2. In Vercel → Settings → Domains → Add your domain
3. Add the DNS records Vercel shows you
4. Wait 5-30 minutes → Done!

## Project Structure

```
app/                    → Next.js pages and routes
  studio/               → Sanity Studio (your CMS dashboard)
components/
  blocks/               → One component per CMS block type
  ui/                   → Reusable UI components (scroll reveal, etc.)
sanity/
  schemas/documents/    → CMS document types (projects, jams, etc.)
  schemas/blocks/       → CMS block types (hero, portfolio grid, etc.)
  lib/                  → GROQ queries and image helpers
```

## Common Tasks

| Task | Where |
|------|-------|
| Change colors | Studio → Site Settings → Theme |
| Add a project | Studio → Portfolio Projects → Create |
| Add a page section | Studio → Pages → Homepage → Add block |
| Reorder sections | Studio → Pages → Homepage → Drag blocks |
| Change nav links | Studio → Site Settings → Navigation Links |
| Update your bio | Studio → Pages → Homepage → About block |

## Monthly Cost

| Service | Cost |
|---------|------|
| Vercel hosting | $0 |
| Sanity CMS | $0 |
| Domain (optional) | ~$1/mo |
| **Total** | **~$1/mo** |
