import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { bots, botConnections } from '@/lib/bot-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const bot = bots.get(id);
  
  if (!bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

  return NextResponse.json({ bot });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const botConnection = botConnections.get(id);
  
  if (botConnection) {
    try {
      botConnection.quit('Disconnected by user');
    } catch (e) {
      // Bot might already be disconnected
    }
    botConnections.delete(id);
  }

  bots.delete(id);

  return NextResponse.json({ success: true });
}
