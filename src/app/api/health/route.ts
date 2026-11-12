import { NextResponse } from "next/server";
import { getDbHealth } from "@/db";

export async function GET() {
  const dbHealth = await getDbHealth();
  return NextResponse.json({
    status: "healthy",
    domain: "mekengg.com",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth,
  });
}
