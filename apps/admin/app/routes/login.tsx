import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient, setCsrfToken } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Btn } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { setMe } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await apiClient.post<{ user: { id: string; role: 'ADMIN' | 'EDITOR' | 'CLIENT_VIEWER' }; csrfToken: string }>(
        '/auth/login',
        { email, password },
      );
      setCsrfToken(data.csrfToken);
      setMe({ userId: data.user.id, role: data.user.role });
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2.5 text-base';

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-neutral-50)] p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-[var(--color-neutral-200)] bg-white p-6">
        <h1 className="text-xl font-semibold">Најава во админ</h1>
        <div className="mt-5 space-y-3">
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Лозинка" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
          <Btn type="submit" className="w-full" disabled={busy}>{busy ? 'Најава…' : 'Најави се'}</Btn>
        </div>
      </form>
    </div>
  );
}
