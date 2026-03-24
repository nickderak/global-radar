import { NextResponse } from "next/server";

const CHINA_MFA_URL =
  "https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/";

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

function extractArticleBlocks(html: string) {
  const matches = html.match(
    /<li[\s\S]*?<\/li>|<div[\s\S]*?class="[^"]*news[^"]*"[\s\S]*?<\/div>/gi
  );

  return matches ?? [];
}

function extractHref(block: string) {
  const match = block.match(/href="([^"]+)"/i);
  return match ? match[1] : "";
}

function extractTitle(block: string) {
  const linkMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  if (linkMatch) return cleanText(linkMatch[1]);

  return "";
}

function extractDate(block: string) {
  const dateMatch = block.match(
    /\b(\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2})\b/
  );

  return dateMatch ? cleanText(dateMatch[1]) : "";
}

export async function GET() {
  try {
    const res = await fetch(CHINA_MFA_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "GlobalRadar/1.0",
      },
    });

    const html = await res.text();
    const blocks = extractArticleBlocks(html);

    const extracted = blocks.slice(0, 10).map((block, index) => ({
      index: index + 1,
      title: extractTitle(block),
      href: extractHref(block),
      date: extractDate(block),
    }));

    return NextResponse.json({
      status: "ok",
      fetchOk: res.ok,
      statusCode: res.status,
      blockCount: blocks.length,
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