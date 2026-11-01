import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_CREDENTIALS, ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_TOKEN_VALUE } from '@/lib/admin-config';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token === ADMIN_AUTH_TOKEN_VALUE;

  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (
      ADMIN_CREDENTIALS.username &&
      ADMIN_CREDENTIALS.password &&
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_TOKEN_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        message: 'Login berhasil sebagai administrator.',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Username atau password admin salah.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat otentikasi.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true, message: 'Logout berhasil.' });
}

