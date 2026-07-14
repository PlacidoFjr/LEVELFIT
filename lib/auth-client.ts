"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/v1";
const ACCESS_TOKEN_KEY = "levelfit.accessToken";
const CSRF_TOKEN_KEY = "levelfit.csrfToken";
const USER_KEY = "levelfit.user";

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
};

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  csrfToken: string;
  user: AuthUser;
};

type RegisterResponse = {
  verificationRequired: boolean;
  devVerificationToken?: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
};

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: string[];

  constructor(message: string, code: string, status: number, fields?: string[]) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function saveSession(response: LoginResponse) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  window.localStorage.setItem(CSRF_TOKEN_KEY, response.csrfToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  window.dispatchEvent(new Event("levelfit:auth"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(CSRF_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("levelfit:auth"));
}

async function readError(response: Response) {
  try {
    const payload = await response.json() as { error?: { message?: string; code?: string; fields?: string[] } };
    return new ApiClientError(
      payload.error?.message ?? "Não foi possível concluir a solicitação.",
      payload.error?.code ?? "REQUEST_ERROR",
      response.status,
      payload.error?.fields,
    );
  } catch {
    return new ApiClientError("Não foi possível concluir a solicitação.", "REQUEST_ERROR", response.status);
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && path !== "/auth/login" && path !== "/auth/refresh") {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, init, false);
  }

  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginUser(email: string, password: string) {
  const response = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, deviceName: "LevelFit Web" }),
  }, false);
  saveSession(response);
  return response.user;
}

export async function registerUser(input: { displayName: string; email: string; password: string; gender?: string }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const registration = await request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      displayName: input.displayName,
      gender: input.gender || undefined,
      termsAccepted: true,
      sensitiveDataConsent: true,
      timezone,
    }),
  }, false);

  if (registration.devVerificationToken) {
    await request<{ emailVerified: boolean }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token: registration.devVerificationToken }),
    }, false);
    return loginUser(input.email, input.password);
  }

  return null;
}

export async function refreshSession() {
  if (typeof window === "undefined") return false;
  const csrfToken = window.localStorage.getItem(CSRF_TOKEN_KEY);
  if (!csrfToken) return false;

  try {
    const response = await request<Omit<LoginResponse, "user">>("/auth/refresh", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
    }, false);
    window.localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    window.localStorage.setItem(CSRF_TOKEN_KEY, response.csrfToken);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export async function fetchMe() {
  return request<AuthUser & { profile?: { displayName?: string | null } }>("/me");
}

export async function logoutUser() {
  try {
    await request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ allDevices: false }),
    }, false);
  } finally {
    clearSession();
  }
}

export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!getAccessToken()) await refreshSession();
      if (!getAccessToken()) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const me = await fetchMe();
        const nextUser = {
          id: me.id,
          email: me.email,
          displayName: me.profile?.displayName ?? me.displayName,
        };
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        if (active) setUser(nextUser);
      } catch {
        clearSession();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    function sync() {
      setUser(readStoredUser());
    }

    void load();
    window.addEventListener("storage", sync);
    window.addEventListener("levelfit:auth", sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener("levelfit:auth", sync);
    };
  }, []);

  return { user, loading, authenticated: Boolean(user) };
}
