import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin
} from 'next-firebase-auth-edge';
import { clientConfig, serverConfig } from './config';
 
const PUBLIC_PATHS = ['/', '/login', '/reset-password', '/signup'];
 
export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    refreshTokenPath: '/api/refresh-token',
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    enableMultipleCookies: true,
    enableCustomToken: true,
    debug: true,
    // tenantId: 'your-tenant-id',
    checkRevoked: true,
    authorizationHeaderName: 'Authorization',
    dynamicCustomClaimsKeys: ['someCustomClaim'],
    handleValidToken: async (_, headers) => {
      // Authenticated user should not be able to access /login, /register and /reset-password routes
      if (PUBLIC_PATHS.some(path => request.nextUrl.pathname === path)) {
        return redirectToHome(request);
      }
 
      return NextResponse.next({
        request: {
          headers
        }
      });
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', {reason});
 
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', {error});
 
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    }
  });
}
 
export const config = {
  matcher: [
    '/api/login',
    '/api/logout',
    '/api/refresh-token',
    '/((?!_next|favicon.ico|api|.*\\.|$).*)'
  ]
};