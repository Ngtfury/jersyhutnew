import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  verifyAdminPassword,
  isDefaultPasswordInUse
} from '../../../../lib/adminAuth';

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const isValid = await verifySessionToken(sessionCookie.value);
    return NextResponse.json(
      {
        authenticated: isValid,
        isDefaultPassword: isDefaultPasswordInUse()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect administrator password. Access denied.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json(
      {
        success: true,
        message: 'Administrator session authenticated',
        isDefaultPassword: isDefaultPasswordInUse()
      },
      { status: 200 }
    );

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60 // 14 days
    });

    return response;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json(
      { error: 'Internal authentication server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    );
  }
}
