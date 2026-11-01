import { NextResponse } from 'next/server';
import { recordSessionActivityAction } from '@/actions/auth-session';

export async function POST() {
  const result = await recordSessionActivityAction();
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 401 }
    );
  }
  return NextResponse.json({ ok: true });
}
