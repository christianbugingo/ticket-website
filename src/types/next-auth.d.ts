// types/next-auth.d.ts
import 'next-auth';
import { User as PrismaUser } from '@prisma/client';

declare module 'next-auth' {
  /**
   * Extends the built-in User type with your Prisma User model fields
   */
  interface User extends PrismaUser {
    // Add any additional fields your auth uses
    id: string; // Ensure this matches your Prisma model
    role: string;
  }
  
  /**
   * Extends the built-in Session type
   */
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT type
   */
  interface JWT {
    id: string;
    role: string;
  }
}