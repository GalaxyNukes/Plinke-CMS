export default function NotFound() {
  return (
    <main className="max-w-[1320px] mx-auto p-5">
      <section
        className="rounded-[24px] p-10 text-center"
        style={{
          background: "var(--bg-dark)",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          className="font-display text-6xl font-extrabold text-white mb-4"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          404
        </h1>
        <p className="text-white/50 text-lg mb-8">
          This page doesn&apos;t exist. Maybe it was moved or deleted.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider"
          style={{ background: "var(--accent, #c9fb00)", color: "#0e0e10" }}
        >
          Go Home
        </a>
      </section>
    </main>
  );
}
