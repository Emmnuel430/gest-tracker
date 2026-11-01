import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import {
  SESSION_COOKIE_NAME,
  REMEMBER_ME_MAX_AGE_MS,
  evaluateSessionPolicy,
  encodeSignedSession,
  decodeAndVerifySession,
} from '@/lib/session-policy';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques, cron et routes d'API sessions / exports
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/export') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/session') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isPublicPage =
    pathname === '/' ||
    pathname === '/demo' ||
    pathname.startsWith('/demo');

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/mot-de-passe-oublie');

  // Si l'utilisateur n'est pas connecté et n'est pas sur une page publique ou d'auth, redirection vers /login
  if (!user && !isPublicPage && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est authentifié et navigue sur une page protégée, appliquer la politique de session
  if (user && !isPublicPage && !isAuthPage) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      // Migration douce : première visite sans cookie gt_session -> initialiser session active
      const now = Date.now();
      const token = await encodeSignedSession({
        userId: user.id,
        remember: false,
        issuedAt: now,
        lastActivityAt: now,
      });
      supabaseResponse.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    } else {
      const session = await decodeAndVerifySession(sessionCookie.value);

      if (!session) {
        // Signature altérée ou cookie corrompu
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('reason', 'expired');
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.delete(SESSION_COOKIE_NAME);
        return redirectResponse;
      }

      const evaluation = evaluateSessionPolicy(session);

      if (evaluation === 'EXPIRED_IDLE') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('reason', 'idle');
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.delete(SESSION_COOKIE_NAME);
        return redirectResponse;
      }

      if (evaluation === 'EXPIRED_MAX_AGE') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('reason', 'expired');
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.delete(SESSION_COOKIE_NAME);
        return redirectResponse;
      }

      if (evaluation === 'VALID_REFRESH') {
        const now = Date.now();
        const updatedToken = await encodeSignedSession({
          ...session,
          lastActivityAt: now,
        });
        const isProduction = process.env.NODE_ENV === 'production';

        if (session.remember) {
          const remainingSeconds = Math.max(
            0,
            Math.floor((session.issuedAt + REMEMBER_ME_MAX_AGE_MS - now) / 1000)
          );
          supabaseResponse.cookies.set(SESSION_COOKIE_NAME, updatedToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: remainingSeconds,
          });
        } else {
          supabaseResponse.cookies.set(SESSION_COOKIE_NAME, updatedToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
          });
        }
      }
    }
  }

  // Si l'utilisateur est déjà connecté et tente d'aller sur la vitrine publique ou les pages d'auth, redirection vers le dashboard (/app)
  if (
    user &&
    (pathname === '/' ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname.startsWith('/mot-de-passe-oublie'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/',
    '/demo',
    '/demo/:path*',
    '/app',
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
