import { NextResponse } from 'next/server';

// Returns runtime-only configuration v
// alues. This route reads environment
// variables on the server at runtime. Do NOT expose sensitive values here.

// 🔑 FORCE Node.js runtime (not Edge)
export const runtime = 'nodejs';

// 🔑 FORCE runtime execution (no static caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  const gatewayApiUrl = process.env.GATEWAY_API_URL || null;
  return NextResponse.json({ gatewayApiUrl });
}
