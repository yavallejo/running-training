// Secure auth for personal use with hashed credentials
const USERNAME = "yadira";
const PASSWORD_HASH = "c6269c975d9b548d36ad19673a4cc86086a081fa8de06162e5a1a5c7bb3e2400"; // SHA-256 hash of "running2026"
const CREDENTIALS_KEY = "yadira_credentials";
const SESSION_KEY = "yadira_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Initialize credentials in localStorage
export function initializeCredentials(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({
    username: USERNAME,
    passwordHash: PASSWORD_HASH
  }));
}

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined") return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate credentials
export async function validateCredentials(username: string, password: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  // Initialize if not exists
  if (!localStorage.getItem(CREDENTIALS_KEY)) {
    initializeCredentials();
  }
  
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (!stored) return false;
    
    const creds = JSON.parse(stored);
    const inputHash = await hashPassword(password);
    return username.toLowerCase() === creds.username.toLowerCase() && inputHash === creds.passwordHash;
    } catch (error) {
    console.error('Auth validation error:', error);
    return false;
  }
}

// Session management
interface Session {
  authenticated: boolean;
  name: string;
  expiresAt: number;
}

export function createSession(name: string): void {
  if (typeof window === "undefined") return;
  const session: Session = {
    authenticated: true,
    name,
    expiresAt: Date.now() + SESSION_DURATION
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    const session: Session = JSON.parse(stored);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
