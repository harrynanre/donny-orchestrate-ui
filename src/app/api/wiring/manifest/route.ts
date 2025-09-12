import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      name: "lab",
      ui: "http://HOST:5000",
      api: "http://HOST:5055"
    },
    generated_at: "PLACEHOLDER",
    global: {
      deps: {}
    },
    features: {}
  });
}