import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '../../../../lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbahumjewlpodkuktzqb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseAdmin() {
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;
    return await verifySessionToken(token);
  } catch (e) {
    return false;
  }
}

/**
 * GET: Retrieve all users with verified / unverified status
 */
export async function GET(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (error) {
      console.error('Failed to list users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedUsers = (data?.users || []).map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || '',
      phone: u.user_metadata?.phone || u.phone || '',
      email_confirmed_at: u.email_confirmed_at,
      is_verified: Boolean(u.email_confirmed_at),
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: u.role || 'authenticated'
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      totalCount: formattedUsers.length,
      verifiedCount: formattedUsers.filter(u => u.is_verified).length,
      unverifiedCount: formattedUsers.filter(u => !u.is_verified).length
    });
  } catch (err) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a user by ID
 */
export async function DELETE(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Failed to delete user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Admin users DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST: Bulk actions (e.g., delete all unverified accounts)
 */
export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 });
    }

    if (action === 'delete_unverified') {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;

      const unverified = (data.users || []).filter(u => !u.email_confirmed_at);
      let deletedCount = 0;

      for (const u of unverified) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(u.id);
          deletedCount++;
        } catch (e) {
          console.warn(`Failed to delete user ${u.id}:`, e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} unverified users`,
        deletedCount
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin users POST action error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

