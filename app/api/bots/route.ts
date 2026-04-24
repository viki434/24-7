import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { accounts, bots, botConnections, generateId, type BotInstance } from '@/lib/bot-manager';

// Dynamic import for mineflayer (server-side only)
let mineflayer: typeof import('mineflayer') | null = null;

async function getMineflayer() {
  if (!mineflayer) {
    mineflayer = await import('mineflayer');
  }
  return mineflayer;
}

export async function GET() {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botList = Array.from(bots.values());
  return NextResponse.json({ bots: botList });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { accountId, server, port = 25565 } = await request.json();

    const account = accounts.get(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const botId = generateId();
    const botInstance: BotInstance = {
      id: botId,
      accountId,
      server,
      port,
      status: 'connecting',
      chatLog: [],
    };

    bots.set(botId, botInstance);

    // Create mineflayer bot
    try {
      const mf = await getMineflayer();
      
      const botOptions: any = {
        host: server,
        port,
        username: account.username,
        version: false, // Auto-detect version
      };

      // Add auth for premium accounts
      if (account.auth === 'microsoft') {
        botOptions.password = account.password;
        botOptions.auth = 'microsoft';
      }

      const bot = mf.createBot(botOptions);

      botConnections.set(botId, bot);

      // Bot event handlers
      bot.on('spawn', () => {
        const instance = bots.get(botId);
        if (instance) {
          instance.status = 'online';
          instance.chatLog.push({
            timestamp: new Date(),
            message: `Bot spawned in ${server}`,
            type: 'system'
          });
        }
      });

      bot.on('health', () => {
        const instance = bots.get(botId);
        if (instance) {
          instance.health = bot.health;
          instance.food = bot.food;
        }
      });

      bot.on('move', () => {
        const instance = bots.get(botId);
        if (instance && bot.entity) {
          instance.position = {
            x: Math.round(bot.entity.position.x),
            y: Math.round(bot.entity.position.y),
            z: Math.round(bot.entity.position.z),
          };
        }
      });

      bot.on('chat', (username: string, message: string) => {
        const instance = bots.get(botId);
        if (instance) {
          instance.chatLog.push({
            timestamp: new Date(),
            message: `<${username}> ${message}`,
            type: 'chat'
          });
          // Keep only last 100 messages
          if (instance.chatLog.length > 100) {
            instance.chatLog = instance.chatLog.slice(-100);
          }
        }
      });

      bot.on('message', (jsonMsg: any) => {
        const instance = bots.get(botId);
        if (instance) {
          const msg = jsonMsg.toString();
          if (!msg.startsWith('<')) { // Avoid duplicating chat messages
            instance.chatLog.push({
              timestamp: new Date(),
              message: msg,
              type: 'system'
            });
            if (instance.chatLog.length > 100) {
              instance.chatLog = instance.chatLog.slice(-100);
            }
          }
        }
      });

      bot.on('error', (err: Error) => {
        const instance = bots.get(botId);
        if (instance) {
          instance.status = 'error';
          instance.errorMessage = err.message;
          instance.chatLog.push({
            timestamp: new Date(),
            message: `Error: ${err.message}`,
            type: 'system'
          });
        }
      });

      bot.on('kicked', (reason: string) => {
        const instance = bots.get(botId);
        if (instance) {
          instance.status = 'offline';
          instance.chatLog.push({
            timestamp: new Date(),
            message: `Kicked: ${reason}`,
            type: 'system'
          });
        }
      });

      bot.on('end', (reason: string) => {
        const instance = bots.get(botId);
        if (instance) {
          instance.status = 'offline';
          instance.chatLog.push({
            timestamp: new Date(),
            message: `Disconnected: ${reason || 'Connection ended'}`,
            type: 'system'
          });
        }
        botConnections.delete(botId);
      });

    } catch (error: any) {
      botInstance.status = 'error';
      botInstance.errorMessage = error.message;
    }

    return NextResponse.json({ success: true, bot: botInstance });
  } catch (error) {
    console.error('Error creating bot:', error);
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 });
  }
}
