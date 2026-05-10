import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * XORAS // INSTITUTIONAL EDGE MIDDLEWARE
 * Nuance: Combined JWT Auth + Upstash Rate Limiting at the Edge.
 */

export const runtime = 'edge';

// Nuance: Initialize Upstash Redis for global rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit:global',
});

const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
  
  // 1. RATE LIMITING LAYER
  let currentLimit = globalRatelimit;
  if (pathname.startsWith('/api/auth')) {
    currentLimit = authRatelimit;
  }

  const { success, limit, reset, remaining } = await currentLimit.limit(ip);
  if (!success) {
    return new NextResponse('Institutional Rate Limit Exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  // 2. AUTHENTICATION LAYER
  const publicPaths = ['/login', '/signup', '/api/auth', '/static', '/_next'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('access_token')?.value 
    || req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    if (pathname === '/') return NextResponse.next();
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-role', payload.role as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('access_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
