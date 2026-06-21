import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<Response | void> {
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

  // 3. Enable Draft Mode (Awaited for Next.js 15 compatibility)
  const draft = await draftMode();
  draft.enable();

  // 4. Modify Cookie to bypass Cross-Site Iframe restrictions
  const cookieStore = await cookies();
  const cookie = cookieStore.get('__prerender_bypass');

  if (cookie) {
    cookieStore.set({
      name: '__prerender_bypass',
      value: cookie.value,
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'none', // Critical for Contentful Side-by-Side View
    });
  }

  // 5. Redirect to target page
  redirect(path);
}
