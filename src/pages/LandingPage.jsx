import { useState } from 'react';
import { Ticket, ShieldCheck, Sparkles } from 'lucide-react';
import RegistrationModal from '../components/public/RegistrationModal.jsx';

export default function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold mb-5">
        <span className="h-px w-9 bg-gradient-to-r from-transparent to-gold-deep" />
        Sorteo abierto
        <span className="h-px w-9 bg-gradient-to-l from-transparent to-gold-deep" />
      </div>

      <h1 className="font-display text-4xl sm:text-6xl tracking-wide bg-gradient-to-b from-gold-pale via-gold to-gold-deep bg-clip-text text-transparent drop-shadow-[0_2px_0_rgba(74,44,5,0.6)]">
        GRAN SORTEO
      </h1>
      <p className="mt-3 max-w-md text-cream-dim text-sm sm:text-base">
        Regístrate con tu comprobante de depósito y entra a la ronda final. Un cupo, un número de celular:
        cada participante solo puede inscribirse una vez.
      </p>

      <button
        onClick={() => setOpen(true)}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-pale via-gold to-gold-deep px-8 py-3.5 font-body font-semibold uppercase tracking-wider text-[#2a1503] shadow-[0_10px_30px_rgba(240,196,74,0.25)] hover:brightness-105 transition"
      >
        <Ticket size={18} /> Inscribirme al sorteo
      </button>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <InfoCard icon={<ShieldCheck size={18} />} title="Sin duplicados" text="Un número de celular = un solo ticket." />
        <InfoCard icon={<Sparkles size={18} />} title="Sorteo transparente" text="El ganador se elige al azar entre los aprobados." />
        <InfoCard icon={<Ticket size={18} />} title="Ticket numerado" text="Cada inscripción recibe un número consecutivo." />
      </div>

      <RegistrationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="ticket-card px-5 py-5 text-left">
      <div className="text-gold mb-2">{icon}</div>
      <p className="font-body font-semibold text-sm text-cream mb-1">{title}</p>
      <p className="text-xs text-cream-dim">{text}</p>
    </div>
  );
}
