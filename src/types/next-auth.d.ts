import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: "admin" | "user" | string;
    };
    accessToken: string;
    refreshToken: string;
    acceptedAgreementVersion: string | null;
    error?: "RefreshAccessTokenError";
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: "admin" | "user" | string;
    token: string;
    refreshToken: string;
    accessTokenExpires: number;
    acceptedAgreementVersion: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image: string;
    role: "admin" | "user" | string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    acceptedAgreementVersion: string | null;
    error?: "RefreshAccessTokenError";
  }
}
