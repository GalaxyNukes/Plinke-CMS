import { client } from "@/sanity/sanity.client";
import { pageQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import { BlockRenderer } from "@/components/BlockRenderer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 60;

export default async function HomePage() {
  let page = null;
  let settings = null;

  try {
    [page, settings] = await Promise.all([
      client.fetch(pageQuery, { slug: "home" }),
      client.fetch(siteSettingsQuery),
    ]);
  } catch (e) {
    // CMS not connected yet — show fallback
  }

  // Fallback if CMS isn't connected yet
  if (!page) {
    return (
      <main className="max-w-[1320px] mx-auto p-5">
        <section
          className="rounded-card p-10 text-center"
          style={{ background: "var(--bg-dark)", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <h1 className="font-display text-4xl font-extrabold text-white mb-4">
            Noa Plinke
          </h1>
          <p className="text-white/50 text-lg max-w-md mb-8">
            Your portfolio is almost ready! Connect Sanity CMS to start building your page.
          </p>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 max-w-lg text-left">
            <h2 className="font-display text-xl font-bold text-white mb-4">Quick Setup</h2>
            <ol className="text-white/60 text-sm space-y-3 list-decimal list-inside">
              <li>Create a free account at <span className="text-[var(--accent)]">sanity.io</span></li>
              <li>Copy your Project ID into <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">.env.local</code></li>
              <li>Run <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">npm run dev</code> and visit <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/studio</code></li>
              <li>Create a Page called &quot;Homepage&quot; with slug &quot;home&quot;</li>
              <li>Add blocks and hit Publish!</li>
            </ol>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <Navbar settings={settings} />
      <BlockRenderer blocks={page.blocks || []} settings={settings} />
      <Footer settings={settings} />
    </main>
  );
}
