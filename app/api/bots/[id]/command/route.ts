import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { bots, botConnections } from '@/lib/bot-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action, data } = await request.json();

  const botConnection = botConnections.get(id);
  const botInstance = bots.get(id);

  if (!botConnection || !botInstance) {
    return NextResponse.json({ error: 'Bot not found or not connected' }, { status: 404 });
  }

  try {
    switch (action) {
      case 'jump':
        botConnection.setControlState('jump', true);
        setTimeout(() => botConnection.setControlState('jump', false), 500);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: '[ACTION] Jumping',
          type: 'command'
        });
        break;

      case 'forward':
        botConnection.setControlState('forward', true);
        setTimeout(() => botConnection.setControlState('forward', false), 1000);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: '[ACTION] Moving forward',
          type: 'command'
        });
        break;

      case 'back':
        botConnection.setControlState('back', true);
        setTimeout(() => botConnection.setControlState('back', false), 1000);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: '[ACTION] Moving backward',
          type: 'command'
        });
        break;

      case 'left':
        botConnection.setControlState('left', true);
        setTimeout(() => botConnection.setControlState('left', false), 1000);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: '[ACTION] Moving left',
          type: 'command'
        });
        break;

      case 'right':
        botConnection.setControlState('right', true);
        setTimeout(() => botConnection.setControlState('right', false), 1000);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: '[ACTION] Moving right',
          type: 'command'
        });
        break;

      case 'sneak':
        const sneaking = botConnection.getControlState('sneak');
        botConnection.setControlState('sneak', !sneaking);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: `[ACTION] ${!sneaking ? 'Started' : 'Stopped'} sneaking`,
          type: 'command'
        });
        break;

      case 'sprint':
        const sprinting = botConnection.getControlState('sprint');
        botConnection.setControlState('sprint', !sprinting);
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: `[ACTION] ${!sprinting ? 'Started' : 'Stopped'} sprinting`,
          type: 'command'
        });
        break;

      case 'respawn':
        if (botConnection.health === 0) {
          botConnection.respawn();
          botInstance.chatLog.push({
            timestamp: new Date(),
            message: '[ACTION] Respawning',
            type: 'command'
          });
        }
        break;

      case 'disconnect':
        botConnection.quit('Disconnected by user');
        botInstance.status = 'offline';
        botInstance.chatLog.push({
          timestamp: new Date(),
          message: '[ACTION] Disconnected',
          type: 'command'
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
