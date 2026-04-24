'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MinecraftAccount {
  id: string;
  username: string;
  password: string;
  auth: 'microsoft' | 'offline';
  addedAt: string;
}

interface AccountManagerProps {
  accounts: MinecraftAccount[];
  onAccountAdded: () => void;
  onDeleteAccount: (id: string) => void;
}

export function AccountManager({ accounts, onAccountAdded, onDeleteAccount }: AccountManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState<'microsoft' | 'offline'>('microsoft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, auth: authType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add account');
        return;
      }

      setUsername('');
      setPassword('');
      setShowAddForm(false);
      onAccountAdded();
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Minecraft Accounts</h2>
          <p className="text-sm text-zinc-400">Manage your Minecraft accounts for bot connections</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </Button>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Add Minecraft Account</CardTitle>
            <CardDescription className="text-zinc-400">
              Add a premium Microsoft account or an offline/cracked account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Auth Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Account Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthType('microsoft')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      authType === 'microsoft'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium">Premium (Microsoft)</div>
                    <div className="text-xs mt-1 opacity-70">Login with Microsoft account</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType('offline')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      authType === 'offline'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium">Offline</div>
                    <div className="text-xs mt-1 opacity-70">For cracked/offline servers</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  {authType === 'microsoft' ? 'Microsoft Email' : 'Username'}
                </label>
                <Input
                  type={authType === 'microsoft' ? 'email' : 'text'}
                  placeholder={authType === 'microsoft' ? 'email@outlook.com' : 'Username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              {authType === 'microsoft' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your Microsoft password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                    required
                  />
                  <p className="text-xs text-zinc-500">
                    Your password is stored securely and only used for authentication.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Account List */}
      {accounts.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Accounts Yet</h3>
            <p className="text-zinc-400">Add your first Minecraft account to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      account.auth === 'microsoft' ? 'bg-blue-500/10' : 'bg-zinc-700/50'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        account.auth === 'microsoft' ? 'text-blue-400' : 'text-zinc-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{account.username}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          account.auth === 'microsoft'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {account.auth === 'microsoft' ? 'Premium' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAccount(account.id)}
                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
