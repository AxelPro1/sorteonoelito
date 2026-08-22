export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatPhone(phone) {
  if (!phone) return '—';
  return phone.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
}

export const STATUS_LABEL = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado'
};
