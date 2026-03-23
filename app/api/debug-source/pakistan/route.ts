import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://mofa.gov.pk/press-releases/";

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html",
      },
    });

    const text = await res.text();

    return NextResponse.json({
      url,
      ok: res.ok,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      sample: text.slice(0, 1000),
    });
  } catch (error) {
    return NextResponse.json({
      url,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}