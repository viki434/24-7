import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'minecraft-bot-manager-secret-key-change-in-production';

// Admin credentials (hardcoded as requested)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin1';

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession(): Promise<string> {
  // Simple session token
  const token = Buffer.from(JSON.stringify({
    user: 'admin',
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  })).toString('base64');
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.user === 'admin' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export async function getSession(): Promise<{ isAuthenticated: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    return { isAuthenticated: false };
  }
  
  const isValid = await verifySession(token);
  return { isAuthenticated: isValid };
}
