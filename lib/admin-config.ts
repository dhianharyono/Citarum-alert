/**
 * Administrative configuration and runtime secrets management
 * for CitarumAlert Platform.
 */

// Runtime mutable configuration (survives requests without restarting Next.js server)
let runtimeGeminiApiKey: string = process.env.GEMINI_API_KEY || '';

export const ADMIN_CREDENTIALS = {
  username: (process.env.ADMIN_USERNAME || '').trim(),
  password: (process.env.ADMIN_PASSWORD || '').trim(),
};

// Simple secure session token for admin authentication
export const ADMIN_AUTH_COOKIE_NAME = 'citarum_admin_session';
export const ADMIN_AUTH_TOKEN_VALUE = 'citarum_admin_secure_token_v1';

export function getGeminiApiKey(): string {
  return runtimeGeminiApiKey || process.env.GEMINI_API_KEY || '';
}

export function setGeminiApiKey(newKey: string): void {
  runtimeGeminiApiKey = (newKey || '').trim();
}

export function getMaskedGeminiKey(): { configured: boolean; masked: string } {
  const key = getGeminiApiKey();
  if (!key) {
    return { configured: false, masked: 'Belum Dikonfigurasi' };
  }
  if (key.length <= 8) {
    return { configured: true, masked: '••••••••' };
  }
  const prefix = key.slice(0, 6);
  const suffix = key.slice(-4);
  return { configured: true, masked: `${prefix}...${suffix}` };
}
