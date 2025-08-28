
import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = 'ADMIN' // or fetch from DB
      }
      return token
    }
  }
}
