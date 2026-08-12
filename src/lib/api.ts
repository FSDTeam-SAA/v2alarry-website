import axios from "axios";
import { getSession } from "next-auth/react";

import { notifySessionExpired } from "@/features/auth/lib/session-expiry";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const session = await getSession();

      // Let the shared session boundary preserve the draft and ask the user to sign in.
      if (session?.error === "RefreshAccessTokenError") {
        notifySessionExpired();
        return Promise.reject(error);
      }

      // If we have a new access token, retry the request
      if (session?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401) notifySessionExpired();

    return Promise.reject(error);
  },
);
