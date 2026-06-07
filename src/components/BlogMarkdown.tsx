import Link from "next/link";
import ReactMarkdown from "react-markdown";

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl md:text-2xl font-bold text-[#222] mt-12 mb-4 leading-snug">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg md:text-xl font-semibold text-[#222] mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[#444] text-base md:text-[1.0625rem] leading-[1.75] mb-5">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-6 space-y-2 mb-6 text-[#444] text-base md:text-[1.0625rem] leading-[1.75]">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-6 text-[#444] text-base md:text-[1.0625rem] leading-[1.75]">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="pl-1">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[#222]">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const isInternal = href?.startsWith("/");
    if (isInternal && href) {
      return (
        <Link href={href} className="text-[#0B3D91] underline underline-offset-2 hover:opacity-80">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className="text-[#0B3D91] underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto mb-8">
      <table className="w-full border-collapse text-left text-[#2A3E66]">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-[#E5E5E5]">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-4 py-3 font-semibold text-[#222] text-sm md:text-base">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-4 py-3 text-sm md:text-base align-top text-[#444]">{children}</td>
  ),
  hr: () => <hr className="my-10 border-[#E5E5E5]" />,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
};

export default function BlogMarkdown({ content }: { content: string }) {
  return (
    <article className="blog-prose">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </article>
  );
}
