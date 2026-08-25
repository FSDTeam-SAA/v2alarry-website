// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { refreshAccessToken } from "@/features/auth/api/refresh-token.api";

const baseUrl =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:9100/api/v1";

const backendTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  access_token_expires_in: z.number().positive(),
  user: z.object({
    id: z.number().int(),
    email: z.string().email(),
    full_name: z.string().min(1),
    role: z.string().min(1),
  }),
});

type BackendTokenResponse = z.infer<typeof backendTokenResponseSchema>;

function getBackendUrl() {
  if (!baseUrl) {
    throw new Error("Authentication service is not configured");
  }

  return baseUrl;
}

async function readBackendTokenResponse(
  response: Response,
): Promise<BackendTokenResponse> {
  const payload: unknown = await response.json().catch(() => undefined);
  const parsed = backendTokenResponseSchema.safeParse(payload);

  if (!response.ok || !parsed.success) {
    throw new Error("Authentication failed");
  }

  return parsed.data;
}

async function exchangeGoogleIdToken(
  idToken: string,
): Promise<BackendTokenResponse> {
  const response = await fetch(`${getBackendUrl()}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
    cache: "no-store",
  });

  return readBackendTokenResponse(response);
}

function getProfileImage(profile: unknown): string {
  if (!profile || typeof profile !== "object") {
    return "";
  }

  const picture = (profile as Record<string, unknown>).picture;
  return typeof picture === "string" ? picture : "";
}

function toSessionToken(response: BackendTokenResponse, image: string) {
  return {
    id: String(response.user.id),
    name: response.user.full_name,
    email: response.user.email,
    image,
    role: response.user.role,
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    accessTokenExpires: Date.now() + response.access_token_expires_in * 1000,
  };
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      try {
        const res = await fetch(`${getBackendUrl()}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          throw new Error("Invalid email or password");
        }

        const data = await res.json();

        if (!data.access_token) {
          throw new Error("Invalid response from server");
        }

        const userRes = await fetch(`${getBackendUrl()}/users/me`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userRes.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userRes.json();

        let exp = Date.now() + 24 * 60 * 60 * 1000;
        try {
          const payload = JSON.parse(atob(data.access_token.split(".")[1]));
          if (payload.exp) {
            exp = payload.exp * 1000;
          }
        } catch (_) {
          // ignore error decoding jwt
        }

        return {
          id: String(userData.id),
          name: userData.full_name || userData.email.split("@")[0],
          email: userData.email,
          image: "",
          role: userData.role || "user",
          token: data.access_token,
          refreshToken: data.refresh_token || "",
          accessTokenExpires: exp,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Invalid email or password");
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  );
}

const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account?.provider === "google") {
        if (!account.id_token) {
          throw new Error("Google sign-in did not return an ID token");
        }

        return {
          ...token,
          ...toSessionToken(
            await exchangeGoogleIdToken(account.id_token),
            getProfileImage(profile),
          ),
        };
      }

      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          accessToken: user.token,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      try {
        const refreshedTokens = await refreshAccessToken(token.refreshToken);

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires:
            Date.now() + refreshedTokens.access_token_expires_in * 1000,
          refreshToken: refreshedTokens.refresh_token,
        };
      } catch {
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.image,
        role: token.role,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
