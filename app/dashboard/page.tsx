'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountManager } from '@/components/account-manager';
import { BotCard } from '@/components/bot-card';
import { ConnectBotModal } from '@/components/connect-bot-modal';

interface MinecraftAccount {
  id: string;
  username: string;
  password: string;
  auth: 'microsoft' | 'offline';
  addedAt: string;
}

interface BotInstance {
  id: string;
  accountId: string;
  server: string;
  port: number;
  status: 'connecting' | 'online' | 'offline' | 'error';
  health?: number;
  food?: number;
  position?: { x: number; y: number; z: number };
  errorMessage?: string;
  chatLog: { timestamp: string; message: string; type: string }[];
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<MinecraftAccount[]>([]);
  const [bots, setBots] = useState<BotInstance[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'bots'>('accounts');

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  }, []);

  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if (data.bots) {
        setBots(data.bots);
      }
    } catch (err) {
      console.error('Failed to fetch bots:', err);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchBots();

    // Poll for bot updates
    const interval = setInterval(fetchBots, 2000);
    return () => clearInterval(interval);
  }, [fetchAccounts, fetchBots]);

  const handleDeleteAccount = async (id: string) => {
    try {
      await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchAccounts();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const handleDeleteBot = async (id: string) => {
    try {
      await fetch(`/api/bots/${id}`, { method: 'DELETE' });
      if (selectedBot === id) {
        setSelectedBot(null);
      }
      fetchBots();
    } catch (err) {
      console.error('Failed to delete bot:', err);
    }
  };

  const onlineBots = bots.filter(b => b.status === 'online').length;
  const totalBots = bots.length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Accounts</p>
                <p className="text-2xl font-bold text-white">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Active Bots</p>
                <p className="text-2xl font-bold text-white">{onlineBots} / {totalBots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Server Status</p>
                <p className="text-2xl font-bold text-white">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'accounts'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Minecraft Accounts
          {activeTab === 'accounts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('bots')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'bots'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Bot Instances
          {activeTab === 'bots' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'accounts' ? (
        <AccountManager
          accounts={accounts}
          onAccountAdded={fetchAccounts}
          onDeleteAccount={handleDeleteAccount}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Bot Instances</h2>
              <p className="text-sm text-zinc-400">Manage your active Minecraft bots</p>
            </div>
            <Button
              onClick={() => setShowConnectModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={accounts.length === 0}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Connect to Server
            </Button>
          </div>

          {accounts.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Accounts Available</h3>
                <p className="text-zinc-400 mb-4">Add a Minecraft account first before connecting to a server.</p>
                <Button
                  onClick={() => setActiveTab('accounts')}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Add Account
                </Button>
              </CardContent>
            </Card>
          ) : bots.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Bots Running</h3>
                <p className="text-zinc-400 mb-4">Connect to a Minecraft server to start your first bot.</p>
                <Button
                  onClick={() => setShowConnectModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Connect to Server
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  account={accounts.find(a => a.id === bot.accountId)}
                  isSelected={selectedBot === bot.id}
                  onSelect={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
                  onDelete={() => handleDeleteBot(bot.id)}
                  onRefresh={fetchBots}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connect Bot Modal */}
      {showConnectModal && (
        <ConnectBotModal
          accounts={accounts}
          onClose={() => setShowConnectModal(false)}
          onConnected={() => {
            setShowConnectModal(false);
            fetchBots();
          }}
        />
      )}
    </div>
  );
}
