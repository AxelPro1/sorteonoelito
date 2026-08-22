import { STATUS_LABEL } from '../../utils/format.js';

const STYLES = {
  pendiente: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  aprobado: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  rechazado: 'bg-red-500/10 text-red-300 border-red-500/30'
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-body font-medium uppercase tracking-wide ${STYLES[status] || STYLES.pendiente}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status] || status}
    </span>
  );
}
