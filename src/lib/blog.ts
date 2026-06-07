import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  keywords?: string;
  author?: string;
  category?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  if (!raw.startsWith("---")) {
    throw new Error("Blog post must start with frontmatter (---)");
  }
  const end = raw.indexOf("---", 3);
  if (end === -1) {
    throw new Error("Blog post frontmatter is not closed");
  }

  const meta: Record<string, string> = {};
  for (const line of raw.slice(3, end).trim().split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return { meta, content: raw.slice(end + 3).trim() };
}

function toPostMeta(meta: Record<string, string>, slugFromFile: string): BlogPostMeta {
  const slug = meta.slug || slugFromFile;
  if (!meta.title || !meta.description || !meta.publishedAt) {
    throw new Error(`Blog post "${slug}" is missing required frontmatter (title, description, publishedAt)`);
  }
  return {
    slug,
    title: meta.title,
    description: meta.description,
    publishedAt: meta.publishedAt,
    updatedAt: meta.updatedAt,
    keywords: meta.keywords,
    author: meta.author || "Conduct Finance",
    category: meta.category || "Business Funding",
  };
}

function readPostFile(filename: string): BlogPost {
  const slugFromFile = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { meta, content } = parseFrontmatter(raw);
  return { ...toPostMeta(meta, slugFromFile), content };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readPostFile(f))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const direct = path.join(BLOG_DIR, `${slug}.md`);
  if (fs.existsSync(direct)) {
    return readPostFile(`${slug}.md`);
  }

  const match = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .find((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8");
      const { meta } = parseFrontmatter(raw);
      return (meta.slug || f.replace(/\.md$/, "")) === slug;
    });

  return match ? readPostFile(match) : null;
}

export function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatBlogDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
