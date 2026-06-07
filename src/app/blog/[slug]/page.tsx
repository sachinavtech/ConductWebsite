import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogMarkdown from "@/components/BlogMarkdown";
import { BlogByline, BlogCategory, BlogShell } from "@/components/BlogShell";
import { formatBlogDateShort, getAllPosts, getPostBySlug } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://conductfinance.com/blog/${post.slug}`;

  return {
    title: `${post.title} | Conduct Blog`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author || "Conduct Finance" }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author || "Conduct Finance"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author || "Conduct Finance",
    },
    publisher: {
      "@type": "Organization",
      name: "Conduct Finance",
      logo: {
        "@type": "ImageObject",
        url: "https://conductfinance.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://conductfinance.com/blog/${post.slug}`,
    },
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        <BlogCategory label={post.category || "Business Funding"} />

        <header className="mb-10 pb-10 border-b border-[#E5E5E5]">
          <h1 className="text-3xl md:text-[2.75rem] font-bold leading-tight tracking-tight text-[#222] mb-5">
            {post.title}
          </h1>
          <BlogByline
            author={post.author || "Conduct Finance"}
            dateTime={post.publishedAt}
            dateLabel={formatBlogDateShort(post.publishedAt)}
          />
        </header>

        <BlogMarkdown content={post.content} />

        <footer className="mt-14 pt-8 border-t border-[#E5E5E5]">
          <Link
            href="/blog"
            className="text-sm font-medium text-[#0B3D91] hover:underline underline-offset-2"
          >
            ← All articles
          </Link>
        </footer>
      </article>
    </BlogShell>
  );
}
