import { NextRequest, NextResponse } from 'next/server';
import type { LoginResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Error parsing request JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    const { password } = body;
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid password field' },
        { status: 400 }
      );
    }
    
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
      console.error('APP_PASSWORD environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      const response = NextResponse.json<LoginResponse>({ success: true });
      
      // Set auth cookie - expires in 2 days (rolling refresh in middleware)
      response.cookies.set('dad-aura-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 2, // 2 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json<LoginResponse>(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

