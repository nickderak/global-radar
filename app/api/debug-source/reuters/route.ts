import { NextResponse } from "next/server";

const REUTERS_WORLD_URL = "https://www.reuters.com/world/";

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinks(html: string) {
  const matches = [...html.matchAll(/href="(\/world\/[^"#?]+)"/gi)];
  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

function titleFromUrl(link: string) {
  const raw = link.split("/").filter(Boolean).pop() ?? "reuters-update";

  return raw
    .replace(/-\d{4}-\d{2}-\d{2}$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export async function GET() {
  try {
    const res = await fetch(REUTERS_WORLD_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await res.text();
    const links = extractLinks(html);

    return NextResponse.json({
      status: "ok",
      fetchOk: res.ok,
      statusCode: res.status,
      linkCount: links.length,
      extracted: links.slice(0, 15).map((link, index) => ({
        index: index + 1,
        link,
        titleGuess: titleFromUrl(link),
      })),
      htmlSample: html.slice(0, 500),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}