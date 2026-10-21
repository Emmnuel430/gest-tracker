import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques et assets Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/export') ||
    pathname.startsWith('/api/cron') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/mot-de-passe-oublie');

  // Si l'utilisateur n'est pas connecté et n'est pas sur une page d'auth, redirection vers /login
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est déjà connecté et tente d'aller sur les pages d'auth, redirection vers le dashboard
  if (
    user &&
    (pathname === '/login' ||
      pathname === '/register' ||
      pathname.startsWith('/mot-de-passe-oublie'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/',
    '/entrant',
    '/sortant',
    '/historique',
    '/budgets',
    '/recurrences',
    '/portefeuilles',
    '/dettes',
    '/gestion',
    '/options',
    '/parametres',
    '/bienvenue',
    '/login',
    '/register',
    '/mot-de-passe-oublie',
    '/mot-de-passe-oublie/:path*',
    '/auth/:path*',
  ],
};
