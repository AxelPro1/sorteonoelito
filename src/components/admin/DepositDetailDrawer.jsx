import { useState } from 'react';
import { X, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { fileUrl } from '../../api/client.js';
import { formatDate, formatPhone } from '../../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

export default function DepositDetailDrawer({ participant, onClose, onApprove, onReject }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (!participant) return null;

  const isImage = /\.(jpe?g|png|webp|gif)$/i.test(participant.paymentProof || '');

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-panel border-l border-gold-deep/25 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold-deep/15">
          <div>
            <p className="font-mono text-xs text-gold">TICKET #{participant.ticketNumber}</p>
            <h2 className="font-display text-xl text-gold-pale tracking-wide">{participant.fullName}</h2>
          </div>
          <button onClick={onClose} className="text-cream-dim hover:text-cream">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <StatusBadge status={participant.status} />

          <dl className="space-y-3 text-sm">
            <Row label="Celular" value={formatPhone(participant.phone)} />
            <Row label="Cuenta del depositante" value={participant.accountName} highlight />
            <Row label="Registrado" value={formatDate(participant.createdAt)} />
            {participant.reviewedAt && (
              <Row
                label="Revisado"
                value={`${formatDate(participant.reviewedAt)} por ${participant.reviewedBy?.username || '—'}`}
              />
            )}
            {participant.status === 'rechazado' && participant.rejectionReason && (
              <Row label="Motivo de rechazo" value={participant.rejectionReason} />
            )}
          </dl>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cream-dim mb-2">
              Comprobante de pago
            </p>
            <div className="rounded-lg border border-gold-deep/25 bg-black/25 p-2">
              {isImage ? (
                <img
                  src={fileUrl(participant.paymentProof)}
                  alt="Comprobante de pago"
                  className="w-full rounded-md"
                />
              ) : (
                <a
                  href={fileUrl(participant.paymentProof)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-6 text-sm text-gold-pale"
                >
                  <ExternalLink size={16} /> Abrir comprobante (PDF)
                </a>
              )}
            </div>
          </div>

          {participant.status === 'pendiente' && (
            <div className="space-y-3 pt-2 border-t border-gold-deep/15">
              <button
                disabled={busy}
                onClick={() => run(() => onApprove(participant._id))}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 py-2.5 text-sm font-semibold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> Aprobar depósito
              </button>

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de rechazo (opcional)"
                className="input"
              />
              <button
                disabled={busy}
                onClick={() => run(() => onReject(participant._id, reason))}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/15 border border-red-500/30 py-2.5 text-sm font-semibold uppercase tracking-wider text-red-300 hover:bg-red-500/25 transition-colors disabled:opacity-50"
              >
                <XCircle size={16} /> Rechazar depósito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-cream-dim shrink-0">{label}</dt>
      <dd className={`text-right ${highlight ? 'text-gold-pale font-medium' : 'text-cream'}`}>{value}</dd>
    </div>
  );
}
