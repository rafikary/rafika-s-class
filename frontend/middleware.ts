import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const isAuthed = req.cookies.get('admin_auth')?.value === '1';

  // Allow Next.js assets and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // Allow parent download page (locked mode)
  if (pathname.startsWith('/download-pdf')) {
    if (searchParams.get('student')) {
      return NextResponse.next();
    }

    // Admin without locked params -> go to laporan page
    if (isAuthed) {
      return NextResponse.redirect(new URL('/laporan/bulanan', req.url));
    }

    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Login page should be accessible when not authed
  if (pathname === '/login') {
    if (isAuthed) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  // Protect all other routes
  if (!isAuthed) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
