import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "ui",
    version: "5.0.0",
    ts: new Date().toISOString()
  })
}