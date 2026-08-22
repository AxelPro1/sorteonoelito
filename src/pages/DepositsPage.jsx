import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import client from '../api/client.js';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import DepositDetailDrawer from '../components/admin/DepositDetailDrawer.jsx';
import { formatDate, formatPhone } from '../utils/format.js';

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobado', label: 'Aprobados' },
  { value: 'rechazado', label: 'Rechazados' }
];

export default function DepositsPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const { data } = await client.get('/admin/participants', {
          params: { status: status || undefined, search: search || undefined, page, limit: 20 }
        });
        setRows(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el listado de depósitos');
      } finally {
        setLoading(false);
      }
    },
    [status, search]
  );

  useEffect(() => {
    const t = setTimeout(() => load(1), 300); // debounce de búsqueda
    return () => clearTimeout(t);
  }, [load]);

  const refreshSelected = (updated) => {
    setRows((rs) => rs.map((r) => (r._id === updated._id ? updated : r)));
    setSelected(updated);
  };

  const approve = async (id) => {
    const { data } = await client.patch(`/admin/participants/${id}/approve`);
    refreshSelected(data.data);
  };

  const reject = async (id, reason) => {
    const { data } = await client.patch(`/admin/participants/${id}/reject`, { reason });
    refreshSelected(data.data);
  };

  return (
    <div>
      <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-gold-pale">Depósitos</h1>
          <p className="text-sm text-cream-dim mt-1">{pagination.total} registro(s) en total</p>
        </div>
        <button
          onClick={() => load(pagination.page)}
          className="inline-flex items-center gap-2 rounded-lg border border-gold-deep/30 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-gold-pale hover:bg-white/5"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </header>

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, celular o # ticket…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                status === f.value
                  ? 'bg-gold/15 border-gold/50 text-gold-pale'
                  : 'border-gold-deep/20 text-cream-dim hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="ticket-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold-deep/15 text-left text-[11px] uppercase tracking-wider text-cream-dim">
              <th className="px-4 py-3 font-semibold">Ticket</th>
              <th className="px-4 py-3 font-semibold">Participante</th>
              <th className="px-4 py-3 font-semibold">Celular</th>
              <th className="px-4 py-3 font-semibold">Cuenta depositante</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gold-deep/10">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 w-full bg-white/5 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-cream-dim">
                  No hay depósitos que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => setSelected(p)}
                  className="border-b border-gold-deep/10 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-gold">#{p.ticketNumber}</td>
                  <td className="px-4 py-3 text-cream">{p.fullName}</td>
                  <td className="px-4 py-3 font-mono text-cream-dim">{formatPhone(p.phone)}</td>
                  <td className="px-4 py-3 text-cream-dim">{p.accountName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-cream-dim text-xs">{formatDate(p.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1)}
              className={`h-8 w-8 rounded-lg text-xs font-mono border ${
                pagination.page === i + 1
                  ? 'bg-gold/15 border-gold/50 text-gold-pale'
                  : 'border-gold-deep/20 text-cream-dim hover:bg-white/5'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <DepositDetailDrawer
        participant={selected}
        onClose={() => setSelected(null)}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
}
