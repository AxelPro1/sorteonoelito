import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, XCircle, Dices, ArrowRight } from 'lucide-react';
import client from '../api/client.js';
import StatCard from '../components/admin/StatCard.jsx';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    client
      .get('/admin/stats')
      .then(({ data }) => {
        if (active) setStats(data.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'No se pudieron cargar las estadísticas');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <header className="mb-7">
        <h1 className="font-display text-2xl tracking-wide text-gold-pale">Resumen</h1>
        <p className="text-sm text-cream-dim mt-1">Estado general de las inscripciones al sorteo</p>
      </header>

      {error && (
        <p className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ticket-card h-28 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total inscritos" value={stats.total} icon={Users} />
            <StatCard label="Pendientes" value={stats.pendientes} icon={Clock} tone="warn" />
            <StatCard label="Aprobados" value={stats.aprobados} icon={CheckCircle2} tone="good" />
            <StatCard label="Rechazados" value={stats.rechazados} icon={XCircle} tone="bad" />
          </div>
        )
      )}

      <div className="ticket-card mt-6 px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-body font-semibold text-cream flex items-center gap-2">
            <Dices size={17} className="text-gold" /> Listo para sortear
          </p>
          <p className="text-xs text-cream-dim mt-1">
            {stats ? `${stats.elegiblesParaSorteo} participante(s) aprobado(s) elegibles` : 'Cargando…'}
          </p>
        </div>
        <Link
          to="/admin/sorteo"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-pale via-gold to-gold-deep px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#2a1503]"
        >
          Ir al sorteo <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
