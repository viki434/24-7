// Bot Manager - Handles all Minecraft bot instances
// Note: mineflayer runs on Node.js server-side only

export interface MinecraftAccount {
  id: string;
  username: string;
  password: string;
  auth: 'microsoft' | 'offline';
  addedAt: Date;
}

export interface BotInstance {
  id: string;
  accountId: string;
  server: string;
  port: number;
  status: 'connecting' | 'online' | 'offline' | 'error';
  health?: number;
  food?: number;
  position?: { x: number; y: number; z: number };
  errorMessage?: string;
  chatLog: { timestamp: Date; message: string; type: 'chat' | 'system' | 'command' }[];
}

// In-memory storage (would use a database in production)
export const accounts: Map<string, MinecraftAccount> = new Map();
export const bots: Map<string, BotInstance> = new Map();
export const botConnections: Map<string, any> = new Map(); // Stores actual mineflayer bot instances

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
