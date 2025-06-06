declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      userData?: any
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    userData?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    userData?: any
  }
}
