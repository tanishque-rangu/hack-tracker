import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isEmailAuthorized, getAllowedUserConfig } from '@/lib/auth/allowed-users';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim() || 'OtpAccount-' + Math.random().toString(36).slice(-8);

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase admin client configuration missing.',
        },
        { status: 500 }
      );
    }

    const config = getAllowedUserConfig(normalizedEmail);
    const resolvedName = fullName?.trim() || config?.full_name || normalizedEmail.split('@')[0];

    // Check if user already exists in Supabase
    const { data: userList, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json(
        {
          success: false,
          error: listError.message,
        },
        { status: 500 }
      );
    }

    const existing = userList.users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existing) {
      // Update existing user's password and ensure email is confirmed
      const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          full_name: resolvedName,
        },
      });

      if (updateError) {
        return NextResponse.json(
          {
            success: false,
            error: updateError.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Account updated and confirmed. You can now sign in with your credentials.',
      });
    }

    // Create fresh user in Supabase with pre-confirmed email (zero email rate limits)
    const { error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: resolvedName,
      },
    });

    if (createError) {
      return NextResponse.json(
        {
          success: false,
          error: createError.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and confirmed successfully. Logging you in...',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Server error occurred during registration.',
      },
      { status: 500 }
    );
  }
}
