// Simplified auth for personal use - store credentials in localStorage on first access
const DEFAULT_USERNAME = "yadira";
const DEFAULT_PASSWORD = "running2026"; // You can change this
const CREDENTIALS_KEY = "yadira_credentials_set";

export function getStoredCredentials() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CREDENTIALS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  // First time - set default credentials
  const defaultCreds = { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(defaultCreds));
  return defaultCreds;
}

export function validateCredentials(username: string, password: string): boolean {
  const creds = getStoredCredentials();
  if (!creds) return false;
  return username.toLowerCase() === creds.username.toLowerCase() && password === creds.password;
}

export function setCredentials(username: string, password: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ username, password }));
}
