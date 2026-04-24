import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { accounts, generateId, type MinecraftAccount } from '@/lib/bot-manager';

export async function GET() {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountList = Array.from(accounts.values()).map(acc => ({
    ...acc,
    password: '••••••••' // Hide password in response
  }));

  return NextResponse.json({ accounts: accountList });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password, auth } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (auth === 'microsoft' && !password) {
      return NextResponse.json({ error: 'Password is required for Microsoft accounts' }, { status: 400 });
    }

    const id = generateId();
    const account: MinecraftAccount = {
      id,
      username,
      password: password || '',
      auth: auth || 'offline',
      addedAt: new Date(),
    };

    accounts.set(id, account);

    return NextResponse.json({ 
      success: true, 
      account: { ...account, password: '••••••••' }
    });
  } catch (error) {
    console.error('Error adding account:', error);
    return NextResponse.json({ error: 'Failed to add account' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!accounts.has(id)) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    accounts.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
