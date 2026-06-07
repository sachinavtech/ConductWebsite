import Link from "next/link";
import type { Metadata } from "next";
import { BlogByline, BlogCategory, BlogShell } from "@/components/BlogShell";
import { getAllPosts, formatBlogDateShort } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Conduct Blog — Ideas on business funding",
  description:
    "Articles on merchant cash advances, small business capital, and cash-flow-based funding from Conduct Finance.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Conduct Blog",
    description: "Articles on merchant cash advances and business funding.",
    url: "https://conductfinance.com/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <BlogShell>
      <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        {posts.length === 0 ? (
          <p className="text-[#6F6F6F]">No articles published yet.</p>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {posts.map((post) => (
              <article key={post.slug} className="py-10 first:pt-0 last:pb-0">
                <BlogCategory label={post.category || "Business Funding"} />
                <h2 className="text-2xl md:text-[2rem] font-bold leading-snug tracking-tight mb-4">
                  <Link href={`/blog/${post.slug}`} className="text-[#222] hover:text-[#0B3D91] transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <div className="mb-5">
                  <BlogByline
                    author={post.author || "Conduct Finance"}
                    dateTime={post.publishedAt}
                    dateLabel={formatBlogDateShort(post.publishedAt)}
                  />
                </div>
                <p className="text-[#444] text-base md:text-lg leading-relaxed mb-4">{post.description}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-[#0B3D91] hover:underline underline-offset-2"
                >
                  Read more
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </BlogShell>
  );
}
