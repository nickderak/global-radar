import { NextResponse } from "next/server";

const UN_RSS_URL =
  "https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml";

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(regex);
  return match ? cleanText(match[1]) : "";
}

function parseItems(xml: string) {
  return xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
}

export async function GET() {
  try {
    const res = await fetch(UN_RSS_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    const xml = await res.text();
    const items = parseItems(xml);

    const extracted = items.slice(0, 10).map((item, index) => ({
      index: index + 1,
      title: extractTag(item, "title"),
      link: extractTag(item, "link"),
      pubDate: extractTag(item, "pubDate"),
      description: extractTag(item, "description").slice(0, 200),
    }));

    return NextResponse.json({
      status: "ok",
      fetchOk: res.ok,
      statusCode: res.status,
      itemCount: items.length,
      extracted,
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