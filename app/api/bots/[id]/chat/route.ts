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
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const botConnection = botConnections.get(id);
  const botInstance = bots.get(id);

  if (!botConnection || !botInstance) {
    return NextResponse.json({ error: 'Bot not found or not connected' }, { status: 404 });
  }

  try {
    botConnection.chat(message);
    
    botInstance.chatLog.push({
      timestamp: new Date(),
      message: `[YOU] ${message}`,
      type: 'command'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
