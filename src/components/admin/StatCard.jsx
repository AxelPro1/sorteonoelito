export default function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const toneClasses = {
    default: 'text-gold',
    good: 'text-emerald-300',
    warn: 'text-amber-300',
    bad: 'text-red-300'
  };

  return (
    <div className="ticket-card px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-body font-semibold uppercase tracking-wider text-cream-dim">
          {label}
        </span>
        {Icon && <Icon size={16} className={toneClasses[tone]} />}
      </div>
      <p className="font-mono text-3xl font-bold text-cream">{value}</p>
    </div>
  );
}
