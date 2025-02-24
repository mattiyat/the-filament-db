// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    async authorized({ token }) {
      // Customize this logic as needed
      return !!token;
    }
  }
});

export const config = {
  matcher: ['/protected/:path*'] // Adjust this pattern to match the routes you want to protect
};
