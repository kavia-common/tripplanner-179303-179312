//
// Auth storage utilities for client-side login/signup with secure password hashing.
// Uses Web Crypto SubtleCrypto to hash passwords with a per-user salt.
// Stores only salt and hash in localStorage and a session record when logged in.
//

import { safeParse, safeStringify } from './storage';

// Keys for localStorage
const USERS_KEY = 'wanderplan.auth.users.v1';
const SESSION_KEY = 'wanderplan.auth.session.v1';

// Hashing config
const HASH_ALGO = 'SHA-256';
const TEXT_ENCODER = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

// PUBLIC_INTERFACE
export async function hashPassword(password, saltBase64) {
  /**
   * Hash a password with the provided base64 salt using SHA-256 over (salt || password bytes).
   * Returns base64-encoded hash string.
   */
  const pwdBytes = TEXT_ENCODER.encode(password);
  const saltBytes = base64ToBytes(saltBase64);
  const combined = new Uint8Array(saltBytes.length + pwdBytes.length);
  combined.set(saltBytes, 0);
  combined.set(pwdBytes, saltBytes.length);
  const digest = await crypto.subtle.digest(HASH_ALGO, combined);
  return bytesToBase64(new Uint8Array(digest));
}

// PUBLIC_INTERFACE
export function generateSalt(byteLength = 16) {
  /** Generate a cryptographically secure random salt and return base64 string. */
  const salt = new Uint8Array(byteLength);
  crypto.getRandomValues(salt);
  return bytesToBase64(salt);
}

// PUBLIC_INTERFACE
export function loadUsers() {
  /** Load user map from storage: { [emailLower]: { email, salt, hash, createdAt } } */
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = safeParse(raw, {});
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

// PUBLIC_INTERFACE
export function saveUsers(users) {
  /** Persist users map to storage. */
  try {
    window.localStorage.setItem(USERS_KEY, safeStringify(users));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export async function signup(email, password) {
  /**
   * Create a new user. Lowercases email for storage.
   * Throws Error if user exists or inputs invalid.
   * Returns { email } on success.
   */
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  if (!e || !p) throw new Error('Email and password are required');
  const users = loadUsers();
  if (users[e]) throw new Error('An account with this email already exists');
  const salt = generateSalt();
  const hash = await hashPassword(p, salt);
  users[e] = { email: e, salt, hash, createdAt: new Date().toISOString() };
  saveUsers(users);
  // Auto-login after signup
  setSession({ email: e, loggedInAt: new Date().toISOString() });
  return { email: e };
}

// PUBLIC_INTERFACE
export async function login(email, password) {
  /**
   * Verify email/password against stored hash.
   * Throws Error if invalid credentials.
   * Returns { email } on success and sets session.
   */
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  const users = loadUsers();
  const entry = users[e];
  if (!entry) throw new Error('Invalid email or password');
  const hash = await hashPassword(p, entry.salt);
  if (hash !== entry.hash) throw new Error('Invalid email or password');
  setSession({ email: e, loggedInAt: new Date().toISOString() });
  return { email: e };
}

// PUBLIC_INTERFACE
export function logout() {
  /** Clear session. */
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function getSession() {
  /** Returns current session object { email, loggedInAt } or null. */
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const parsed = safeParse(raw, null);
    if (parsed && parsed.email) return parsed;
    return null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function isAuthenticated() {
  /** Boolean: whether a session exists. */
  return !!getSession();
}

// PUBLIC_INTERFACE
export function setSession(session) {
  /** Persist session object. */
  try {
    window.localStorage.setItem(SESSION_KEY, safeStringify(session));
  } catch {
    // ignore
  }
}

// Helpers: base64 conversions
function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
function base64ToBytes(base64) {
  try {
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
    return arr;
  } catch {
    return new Uint8Array();
  }
}
