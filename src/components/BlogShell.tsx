import Link from "next/link";

export function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-[#222]">
      <header className="border-b border-[#E5E5E5]">
        <div className="w-full pt-4 px-4 md:pt-6 md:px-6">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
          </Link>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6 md:py-8">
          <h1 className="inline-flex items-baseline gap-1.5">
            <Link
              href="/"
              className="text-2xl md:text-4xl font-bold text-[#0B3D91] tracking-tight leading-none hover:opacity-90 transition-opacity"
            >
              Conduct
            </Link>
            <Link
              href="/blog"
              className="text-2xl md:text-4xl font-normal text-[#222] tracking-tight leading-none hover:opacity-90 transition-opacity"
            >
              Blog
            </Link>
          </h1>
        </div>
      </header>
      {children}
    </main>
  );
}

export function BlogByline({ author, dateTime, dateLabel }: { author: string; dateTime: string; dateLabel: string }) {
  return (
    <p className="text-sm text-[#6F6F6F]">
      By <span className="text-[#222]">{author}</span>
      {" · "}
      <time dateTime={dateTime}>on {dateLabel}</time>
    </p>
  );
}

export function BlogCategory({ label }: { label: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6F6F6F] mb-3">{label}</p>
  );
}
