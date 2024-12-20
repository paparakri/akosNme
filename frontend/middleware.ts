// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('userToken');
  const userType = request.cookies.get('userType');
  const { pathname } = request.nextUrl;

  // If trying to access dashboard routes
  if (pathname.includes('dashboard')) {

    console.log("inside middleware if statement")

    // If not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // If not a club user
    if (userType?.value !== 'club') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:route*']
};