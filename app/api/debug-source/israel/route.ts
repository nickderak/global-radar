import { NextResponse } from "next/server";

const ISRAEL_MFA_NEWS_URL =
  "https://www.gov.il/en/collectors/news?officeId=6cbf57de-3976-484a-8666-995ca17899ec";

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
  const matches = [...html.matchAll(/href="([^"]*\/en\/pages\/[^"]*)"/gi)];
  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

function titleFromUrl(link: string) {
  const raw = link.split("/").pop() ?? "israel-update";

  return raw
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export async function GET() {
  try {
    const res = await fetch(ISRAEL_MFA_NEWS_URL, {
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
      extracted: links.slice(0, 10).map((link, index) => ({
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