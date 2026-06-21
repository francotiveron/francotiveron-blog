import { cookies, draftMode } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('x-contentful-preview-secret');
  const rawPath = searchParams.get('path');

  // 1. Validate Secret Token
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  // 2. Validate Path Presence
  if (!rawPath) {
    return new Response('Missing required value for query parameter `path`', { status: 400 });
  }

  const path = decodeURIComponent(rawPath);

  try {
    // 3. Enable Draft Mode safely (handles both Next.js 14 & 15 frameworks)
    const draft = draftMode();
    if (draft instanceof Promise) await draft;
    (draft as any).enable();

    // 4. Extract and patch the cookie safely
    let cookieStore = cookies();
    if (cookieStore instanceof Promise) cookieStore = await cookieStore;
    
    const cookie = cookieStore.get('__prerender_bypass');

    if (cookie) {
      cookieStore.set({
        name: '__prerender_bypass',
        value: cookie.value,
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none', // Required for Contentful's Iframe
      });
    }
  } catch (cookieError) {
    console.error('Failed to patch preview cookies:', cookieError);
    // Fallback: don't crash the server if cookie tweaking fails
  }

  // 5. Native Response Redirect (avoids Next.js internal exception crashes)
  return Response.redirect(new URL(path, request.url));
}
