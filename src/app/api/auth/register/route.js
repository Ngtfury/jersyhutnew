import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbahumjewlpodkuktzqb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseAdmin() {
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, metadata = {} } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Authentication service configuration error' },
        { status: 500 }
      );
    }

    // Create user with email_confirm: false so email verification is strictly required
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: false,
      user_metadata: {
        ...metadata,
        full_name: metadata.full_name || metadata.name || ''
      }
    });

    if (error) {
      const msg = error.message || '';
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please switch to Sign In.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: msg || 'Failed to create account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user
    });
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error during registration' },
      { status: 500 }
    );
  }
}

