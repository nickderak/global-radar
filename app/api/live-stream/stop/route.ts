import { NextResponse } from "next/server";
import { stopLiveSignalStream } from "../../../lib/liveSignalStream";

export async function GET() {
  stopLiveSignalStream();

  return NextResponse.json({
    status: "live stream stopped",
  });
}