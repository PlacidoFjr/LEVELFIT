"use client";

import { useEffect, useState } from "react";
import { createFirebaseUser, firebaseIdToken, signInFirebaseWithEmail } from "./firebase-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/v1";
const ACCESS_TOKEN_KEY = "levelfit.accessToken";
const CSRF_TOKEN_KEY = "levelfit.csrfToken";
const USER_KEY = "levelfit.user";
const REQUEST_TIMEOUT_MS = 120000;

let memoryAccessToken: string | null = null;
let memoryCsrfToken: string | null = null;
let memoryUser: AuthUser | null = null;
let refreshPromise: Promise<boolean> | null = null;
let sessionPromise: Promise<AuthUser | null> | null = null;
let warmupPromise: Promise<void> | null = null;

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  level?: {
    level: number;
    totalXp: number;
    currentLevelXp: number;
    nextLevelXp: number;
  } | null;
  streaks?: Array<{
    type: string;
    currentCount: number;
    bestCount: number;
  }>;
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

type FirebaseLoginInput = {
  idToken: string;
  displayName?: string | null;
  gender?: string;
  timezone?: string;
  termsAccepted?: boolean;
  sensitiveDataConsent?: boolean;
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

function timeoutError() {
  return new ApiClientError("A API ainda está acordando. Aguarde alguns segundos e tente novamente.", "REQUEST_TIMEOUT", 408);
}

async function warmApi() {
  warmupPromise ??= warmApiOnce().finally(() => {
    warmupPromise = null;
  });
  return warmupPromise;
}

async function warmApiOnce() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    // The real authenticated request below will surface the actionable error.
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function readStoredUser(): AuthUser | null {
  if (memoryUser) return memoryUser;
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Browsers can block storage in strict privacy modes. The in-memory copy keeps the current tab usable.
  }
}

function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures; memory is cleared separately.
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1] ?? null;
}

function saveUser(user: AuthUser) {
  memoryUser = user;
  writeStorage(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return memoryAccessToken ?? readStorage(ACCESS_TOKEN_KEY);
}

function saveSession(response: LoginResponse) {
  memoryAccessToken = response.accessToken;
  memoryCsrfToken = response.csrfToken;
  writeStorage(ACCESS_TOKEN_KEY, response.accessToken);
  writeStorage(CSRF_TOKEN_KEY, response.csrfToken);
  saveUser(response.user);
  window.dispatchEvent(new Event("levelfit:auth"));
}

function firebaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  if (code.includes("auth/email-already-in-use")) return new ApiClientError("Este e-mail já está cadastrado. Entre com ele ou recupere sua senha.", "EMAIL_UNAVAILABLE", 409);
  if (code.includes("auth/invalid-credential") || code.includes("auth/user-not-found") || code.includes("auth/wrong-password")) return new ApiClientError("E-mail ou senha inválidos.", "INVALID_CREDENTIALS", 401);
  if (code.includes("auth/unauthorized-domain")) return new ApiClientError("Este domínio ainda não está autorizado no Firebase Authentication.", "FIREBASE_UNAUTHORIZED_DOMAIN", 403);
  if (code.includes("auth/popup-blocked")) return new ApiClientError("O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente novamente.", "FIREBASE_POPUP_BLOCKED", 400);
  if (code.includes("auth/popup-closed-by-user")) return new ApiClientError("Login com Google cancelado.", "LOGIN_CANCELLED", 400);
  if (code.includes("auth/configuration-not-found")) return new ApiClientError("Firebase Auth ainda não está configurado para este domínio.", "FIREBASE_CONFIG_ERROR", 503);
  if (code.includes("auth/operation-not-allowed")) return new ApiClientError("Este método de login ainda não está ativado no Firebase.", "FIREBASE_PROVIDER_DISABLED", 503);
  if (code.includes("auth/network-request-failed")) return new ApiClientError("Falha de rede ao falar com o Firebase. Verifique a conexão e tente novamente.", "FIREBASE_NETWORK_ERROR", 503);
  if (code.includes("auth/too-many-requests")) return new ApiClientError("Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.", "RATE_LIMITED", 429);
  return new ApiClientError("Não foi possível concluir a autenticação agora.", "FIREBASE_AUTH_ERROR", 503);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  memoryAccessToken = null;
  memoryCsrfToken = null;
  memoryUser = null;
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(CSRF_TOKEN_KEY);
  removeStorage(USER_KEY);
  window.dispatchEvent(new Event("levelfit:auth"));
}

async function readError(response: Response) {
  if (response.status === 429) {
    return new ApiClientError("Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.", "RATE_LIMITED", response.status);
  }

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

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: init.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw timeoutError();
    throw new ApiClientError("Não foi possível conectar à API agora. Tente novamente em instantes.", "NETWORK_ERROR", 0);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (response.status === 401 && retry && path !== "/auth/login" && path !== "/auth/refresh") {
    const refreshed = await refreshSession();
    if (refreshed) return apiRequest<T>(path, init, false);
  }

  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginUser(email: string, password: string) {
  try {
    const firebaseUser = await signInFirebaseWithEmail(email, password);
    if (!firebaseUser.emailVerified) {
      throw new ApiClientError("Confirme seu e-mail antes de entrar. Se não encontrar o link em alguns minutos, confira também Spam, Lixo eletrônico e Promoções.", "EMAIL_VERIFICATION_REQUIRED", 403);
    }
    return loginWithFirebaseToken({ idToken: await firebaseIdToken(firebaseUser), displayName: firebaseUser.displayName });
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw firebaseError(error);
  }
}

async function loginWithFirebaseToken(input: FirebaseLoginInput) {
  await warmApi();
  const response = await apiRequest<LoginResponse>("/auth/firebase", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      deviceName: "LevelFit Web",
    }),
  }, false);
  saveSession(response);
  return response.user;
}

export async function legacyLoginUser(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, deviceName: "LevelFit Web" }),
  }, false);
  saveSession(response);
  return response.user;
}

export async function registerUser(input: { displayName: string; email: string; password: string; gender?: string }) {
  try {
    await createFirebaseUser({ email: input.email, password: input.password, displayName: input.displayName });
    return null;
  } catch (error) {
    throw firebaseError(error);
  }
}

export async function legacyRegisterUser(input: { displayName: string; email: string; password: string; gender?: string }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const registration = await apiRequest<RegisterResponse>("/auth/register", {
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
    await apiRequest<{ emailVerified: boolean }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token: registration.devVerificationToken }),
    }, false);
    return loginUser(input.email, input.password);
  }

  return null;
}

export async function refreshSession() {
  refreshPromise ??= refreshSessionOnce().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function refreshSessionOnce() {
  if (typeof window === "undefined") return false;
  const csrfToken = memoryCsrfToken ?? readStorage(CSRF_TOKEN_KEY) ?? readCookie("lf_csrf");
  if (!csrfToken) return false;

  try {
    const response = await apiRequest<Omit<LoginResponse, "user">>("/auth/refresh", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
    }, false);
    memoryAccessToken = response.accessToken;
    memoryCsrfToken = response.csrfToken;
    writeStorage(ACCESS_TOKEN_KEY, response.accessToken);
    writeStorage(CSRF_TOKEN_KEY, response.csrfToken);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export async function fetchMe() {
  return apiRequest<AuthUser & { profile?: { displayName?: string | null }; level?: AuthUser["level"]; streaks?: AuthUser["streaks"] }>("/me");
}

function toAuthUser(me: Awaited<ReturnType<typeof fetchMe>>): AuthUser {
  return {
    id: me.id,
    email: me.email,
    displayName: me.profile?.displayName ?? me.displayName,
    level: me.level ?? null,
    streaks: me.streaks ?? [],
  };
}

async function loadSessionUser() {
  sessionPromise ??= loadSessionUserOnce().finally(() => {
    sessionPromise = null;
  });
  return sessionPromise;
}

async function loadSessionUserOnce() {
  if (!getAccessToken()) await refreshSession();
  if (!getAccessToken()) return null;

  try {
    const me = await fetchMe();
    const nextUser = toAuthUser(me);
    saveUser(nextUser);
    return nextUser;
  } catch {
    clearSession();
    return null;
  }
}

export async function logoutUser() {
  try {
    await apiRequest<void>("/auth/logout", {
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
      const nextUser = await loadSessionUser();
      if (active) {
        setUser(nextUser);
        setLoading(false);
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
