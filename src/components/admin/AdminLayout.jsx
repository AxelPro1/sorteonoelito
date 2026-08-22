import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Dices, LogOut, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/depositos', label: 'Depósitos', icon: Receipt },
  { to: '/admin/sorteo', label: 'Sorteo', icon: Dices }
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-gold-deep/15 bg-panel/60 flex flex-col">
        <div className="px-5 py-6 flex items-center gap-2 border-b border-gold-deep/15">
          <Ticket className="text-gold" size={22} />
          <span className="font-display text-lg tracking-wide text-gold-pale">SORTEO ADMIN</span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-body font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'bg-gold/10 text-gold-pale border-gold'
                    : 'text-cream-dim border-transparent hover:bg-white/5 hover:text-cream'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gold-deep/15">
          <p className="text-xs text-cream-dim mb-2 truncate">
            Conectado como <span className="text-cream">{admin?.username}</span>
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/5 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
