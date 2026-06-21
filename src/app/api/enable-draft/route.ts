import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<Response | void> {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('x-contentful-preview-secret');
  const rawPath = searchParams.get('path') || '/';
  const path = decodeURIComponent(rawPath);

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  if (!path) {
    return new Response('Missing required value for query parameter `path`', { status: 400 });
  }

  // Enable draft mode and fix the cookie to work cross-site (needed for Contentful preview)
  draftMode().enable();
  const cookieStore = cookies();
  const cookie = cookieStore.get('__prerender_bypass')!;
  cookies().set({
    name: '__prerender_bypass',
    value: cookie?.value,
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
  });

  // Relative redirect — stays on the correct domain regardless of hosting provider
  redirect(path);
}
