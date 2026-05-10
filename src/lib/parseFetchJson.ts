/**
 * Parse JSON from a fetch Response. When the server returns HTML (404 page, proxy
 * error, static hosting without API routes), JSON.parse throws
 * `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. This helper detects
 * HTML and returns clear errors instead.
 */

function stripBomAndLeadingWs(text: string): string {
  return text.replace(/^\uFEFF/, "").trimStart();
}

function isProbablyHtml(s: string): boolean {
  const head = stripBomAndLeadingWs(s).slice(0, 160).toLowerCase();
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("<head") ||
    head.startsWith("<title") ||
    (head.startsWith("<") && /\bhtml\b/.test(head))
  );
}

function htmlResponseMessage(status: number): string {
  if (status === 404) {
    return "Form endpoint not found (404). The deployment may not include Next.js API routes — use a Node host (e.g. Vercel) rather than static-only hosting.";
  }
  return `The server returned a web page instead of data (${status}). Please try again or contact support.`;
}

/** Maps raw JSON/SyntaxError messages from legacy code paths to a friendly line. */
export function messageFromPossibleJsonHtmlError(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong. Please try again.";
  const m = err.message;
  if (
    (m.includes("Unexpected token") && m.includes("<")) ||
    m.includes("is not valid JSON") ||
    m.includes("<!DOCTYPE")
  ) {
    return "The server returned a page instead of data. Confirm this site is deployed with API routes enabled, then try again.";
  }
  return m;
}

export async function parseFetchJson<T = Record<string, unknown>>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const raw = await response.text();
  const trimmed = stripBomAndLeadingWs(raw);

  if (!trimmed) {
    throw new Error("Empty response from server. Please try again.");
  }

  if (contentType.includes("text/html") || isProbablyHtml(trimmed)) {
    throw new Error(htmlResponseMessage(response.status));
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    if (isProbablyHtml(trimmed)) {
      throw new Error(htmlResponseMessage(response.status));
    }
    throw new Error("Could not read the server response. Please try again.");
  }
}
