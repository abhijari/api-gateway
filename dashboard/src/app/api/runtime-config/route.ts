import { NextResponse } from 'next/server';

// Returns runtime-only configuration values. This route reads environment
// variables on the server at runtime. Do NOT expose sensitive values here.
export async function GET() {
  const gatewayApiUrl = process.env.GATEWAY_API_URL || null;
  return NextResponse.json({ gatewayApiUrl });
}
