import { LogOut } from 'lucide-react';
import { Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { apiClient } from '../lib/api';
import { useAuth } from '../lib/auth';
import { visibleModules } from '../modules';

export default function Shell() {
  const { me, loading, setMe } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-10 text-[var(--color-neutral-500)]">Се вчитува…</div>;
  if (!me) {
    if (typeof window !== 'undefined') window.location.assign('/admin/login');
    return null;
  }

  const modules = visibleModules(me.role);
  const groups = [...new Set(modules.map((m) => m.group))];

  async function logout() {
    await apiClient.post('/auth/logout');
    setMe(null);
    navigate('/login');
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-[var(--color-neutral-50)]">
      <aside className="border-r border-[var(--color-neutral-200)] bg-white">
        <div className="px-5 py-4 font-[family-name:var(--font-display)] text-lg font-semibold">
          filtervoda<span className="text-[var(--color-accent-layout)]">.admin</span>
        </div>
        <nav className="px-3">
          {groups.map((g) => (
            <Fragment key={g}>
              <div className="mt-4 px-2 text-[10px] font-semibold tracking-wider text-[var(--color-neutral-400)]">{g}</div>
              {modules
                .filter((m) => m.group === g)
                .map((m) => (
                  <NavLink
                    key={m.to}
                    to={m.to}
                    end={m.end}
                    className={({ isActive }) =>
                      `mt-0.5 flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                        isActive ? 'bg-[var(--color-neutral-100)] font-semibold' : 'hover:bg-[var(--color-neutral-100)]'
                      }`
                    }
                  >
                    <span className="size-2 rounded-full" style={{ background: m.dot }} />
                    {m.label}
                  </NavLink>
                ))}
            </Fragment>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-neutral-200)] bg-white px-6 py-3">
          <div className="text-sm text-[var(--color-neutral-500)]">{me.role}</div>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-950)]">
            <LogOut size={16} /> Одјава
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
