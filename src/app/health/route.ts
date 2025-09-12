import { NextResponse } from 'next/server';
import packageJson from '../../../package.json';

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: 'ui',
    version: packageJson.version,
    ts: new Date().toISOString()
  });
}