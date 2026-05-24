import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { iaMockAtivo } from "@/lib/ia-validacao";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      iaMock: iaMockAtivo(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        iaMock: iaMockAtivo(),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
