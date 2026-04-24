'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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

interface MinecraftAccount {
  id: string;
  username: string;
  auth: 'microsoft' | 'offline';
}

interface BotCardProps {
  bot: BotInstance;
  account?: MinecraftAccount;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export function BotCard({ bot, account, isSelected, onSelect, onDelete, onRefresh }: BotCardProps) {
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLogRef.current && isSelected) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [bot.chatLog, isSelected]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'connecting': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    setSendingChat(true);

    try {
      await fetch(`/api/bots/${bot.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      });
      setChatInput('');
      onRefresh();
    } catch (err) {
      console.error('Failed to send chat:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const sendCommand = async (action: string) => {
    try {
      await fetch(`/api/bots/${bot.id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to send command:', err);
    }
  };

  return (
    <Card className={`bg-zinc-900/50 border-zinc-800 transition-all ${isSelected ? 'col-span-full' : ''}`}>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${getStatusColor(bot.status)}`} />
            </div>
            <div>
              <h3 className="font-medium text-white">{account?.username || 'Unknown'}</h3>
              <p className="text-sm text-zinc-400">{bot.server}:{bot.port}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  bot.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' :
                  bot.status === 'connecting' ? 'bg-amber-500/10 text-amber-400' :
                  bot.status === 'error' ? 'bg-red-500/10 text-red-400' :
                  'bg-zinc-700 text-zinc-400'
                }`}>
                  {getStatusText(bot.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelect}
              className="text-zinc-400 hover:text-white"
            >
              <svg className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Stats (always visible) */}
        {bot.status === 'online' && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400">Health</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${((bot.health || 0) / 20) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white">{Math.round(bot.health || 0)}</span>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400">Food</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${((bot.food || 0) / 20) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white">{Math.round(bot.food || 0)}</span>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400">Position</p>
              <p className="text-xs text-white font-mono">
                {bot.position ? `${bot.position.x}, ${bot.position.y}, ${bot.position.z}` : 'Unknown'}
              </p>
            </div>
          </div>
        )}

        {bot.errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {bot.errorMessage}
          </div>
        )}

        {/* Expanded Console */}
        {isSelected && (
          <div className="space-y-4 border-t border-zinc-800 pt-4 mt-4">
            {/* Chat Log */}
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Console</h4>
              <div
                ref={chatLogRef}
                className="bg-zinc-950 border border-zinc-800 rounded-lg h-64 overflow-y-auto p-3 font-mono text-xs space-y-1"
              >
                {bot.chatLog.length === 0 ? (
                  <p className="text-zinc-500">No messages yet...</p>
                ) : (
                  bot.chatLog.map((log, i) => (
                    <div
                      key={i}
                      className={`${
                        log.type === 'command' ? 'text-emerald-400' :
                        log.type === 'chat' ? 'text-white' :
                        'text-zinc-400'
                      }`}
                    >
                      <span className="text-zinc-500">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>{' '}
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message to send in chat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                className="flex-1 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                disabled={bot.status !== 'online'}
              />
              <Button
                onClick={sendChat}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={bot.status !== 'online' || sendingChat}
              >
                Send
              </Button>
            </div>

            {/* Movement Controls */}
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Controls</h4>
              <div className="grid grid-cols-3 gap-2 max-w-[200px]">
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendCommand('forward')}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  disabled={bot.status !== 'online'}
                >
                  W
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendCommand('left')}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  disabled={bot.status !== 'online'}
                >
                  A
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendCommand('back')}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  disabled={bot.status !== 'online'}
                >
                  S
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendCommand('right')}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  disabled={bot.status !== 'online'}
                >
                  D
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommand('jump')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={bot.status !== 'online'}
              >
                Jump
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommand('sneak')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={bot.status !== 'online'}
              >
                Toggle Sneak
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommand('sprint')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={bot.status !== 'online'}
              >
                Toggle Sprint
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommand('respawn')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={bot.status !== 'online' || (bot.health || 20) > 0}
              >
                Respawn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommand('disconnect')}
                className="border-red-900 text-red-400 hover:bg-red-500/10"
                disabled={bot.status !== 'online'}
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
