import { NextResponse } from "next/server";

const JAPAN_URLS = [
  "https://www.mofa.go.jp/press/release/index.html",
  "https://www.mofa.go.jp/press/release/rss.xml",
];

function extractLinks(html: string) {
  const matches = [...html.matchAll(/href="([^"]*\/press\/release\/[^"]*)"/gi)];
  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

export async function GET() {
  const results: {
    url: string;
    ok: boolean;
    status: number | null;
    contentType: string | null;
    sample: string;
    extractedLinks?: string[];
    error?: string;
  }[] = [];

  for (const url of JAPAN_URLS) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html,application/xhtml+xml,application/xml,text/xml",
        },
      });

      const text = await response.text();

      results.push({
        url,
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get("content-type"),
        sample: text.slice(0, 1000),
        extractedLinks: url.includes("index.html")
          ? extractLinks(text).slice(0, 10)
          : [],
      });
    } catch (error) {
      results.push({
        url,
        ok: false,
        status: null,
        contentType: null,
        sample: "",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    status: "ok",
    results,
  });
}