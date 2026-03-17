import { NextResponse } from "next/server";
import { startLiveSignalStream } from "../../../lib/liveSignalStream";

export async function GET() {
  startLiveSignalStream();

  return NextResponse.json({
    status: "live stream started",
  });
}