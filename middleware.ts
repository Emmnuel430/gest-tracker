import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques et assets Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/export') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isLoginPage = pathname === '/login';

  // Si l'utilisateur n'est pas connecté et n'est pas sur /login, on redirige vers /login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est déjà connecté et va sur /login, redirection vers le dashboard
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/', '/entrant', '/sortant', '/historique', '/login'],
};
