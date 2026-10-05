import React, { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEMO_ADMINS = [
  { username: 'admin1', name: 'K. Rajesh (Managing Partner)' },
  { username: 'admin2', name: 'S. Kumar (Fleet Director)' },
  { username: 'admin3', name: 'M. Anitha (Finance Controller)' },
  { username: 'admin4', name: 'V. Senthil (Operations Head)' },
  { username: 'admin5', name: 'P. Karthik (Audit & Inventory)' },
  { username: 'admin6', name: 'D. Ramesh (Admin Coordinator)' },
];

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: (adminUser: any) => void }) {
  const [username, setUsername] = useState('admin1');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          expected_role: 'ADMIN',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save auth data
        if (typeof window !== 'undefined') {
          localStorage.setItem('borewell_admin_user', JSON.stringify(data.user));
          localStorage.setItem('borewell_admin_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(`Cannot connect to backend server at ${API_BASE_URL}. Ensure server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAdmin = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            ⛏️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          Borewell Fleet Admin Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Sign in to monitor all 4 drilling rigs, track manager submissions, and audit metrics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs font-medium flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin1"
                  className="block w-full rounded-xl bg-slate-950/60 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-inner focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl bg-slate-950/60 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-inner focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span> Authenticating...
                  </span>
                ) : (
                  'Sign In to Admin Dashboard'
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Select: 6 Pre-configured Admins (password: password123)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ADMINS.map((adm) => (
                <button
                  key={adm.username}
                  type="button"
                  onClick={() => handleSelectDemoAdmin(adm.username)}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition border ${
                    username === adm.username
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <p className="font-semibold capitalize truncate">{adm.username}</p>
                  <p className="text-[10px] text-slate-500 truncate">{adm.name.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
