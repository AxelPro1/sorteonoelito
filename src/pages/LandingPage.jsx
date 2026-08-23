import { useState, useRef } from 'react';
import { Ticket, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';
import RegistrationModal from '../components/public/RegistrationModal.jsx';

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => console.log("Audio play blocked:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden bg-black text-white">
      
      {/* Estilos CSS con animaciones de latido luminoso y parpadeo rítmico */}
      <style>{`
        @keyframes heartbeat-glow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 15px rgba(240,196,74,0.3));
          }
          15% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 35px rgba(255,223,128,0.9)) drop-shadow(0 0 60px rgba(240,196,74,0.6));
          }
          30% {
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(240,196,74,0.4));
          }
          45% {
            transform: scale(1.03);
            filter: drop-shadow(0 0 30px rgba(255,223,128,0.8));
          }
        }
        @keyframes pulse-glow-box {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(240,196,74,0.3), inset 0 0 15px rgba(240,196,74,0.1);
          }
          15% {
            transform: scale(1.03);
            box-shadow: 0 0 45px rgba(255,223,128,0.8), inset 0 0 25px rgba(255,223,128,0.4);
          }
          30% {
            transform: scale(1);
            box-shadow: 0 0 25px rgba(240,196,74,0.4), inset 0 0 15px rgba(240,196,74,0.1);
          }
          45% {
            transform: scale(1.02);
            box-shadow: 0 0 35px rgba(255,223,128,0.6), inset 0 0 20px rgba(255,223,128,0.3);
          }
        }
        .animate-heartbeat-glow {
          animation: heartbeat-glow 2s infinite ease-in-out;
        }
        .animate-pulse-box {
          animation: pulse-glow-box 2.5s infinite ease-in-out;
        }
        .delay-1 { animation-delay: 0s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.8s; }
      `}</style>

     {/* Video de Fondo Responsive que cubre toda la pantalla sin deformarse */}
<div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover filter brightness-50 contrast-125"
  >
    <source src="/vid.mp4" type="video/mp4" />
    Tu navegador no soporta videos de fondo.
  </video>
  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-[2px]" />
</div>

      {/* Audio en formato MP4 desde la carpeta public */}
      <audio ref={audioRef} loop>
        <source src="/musicn.mp4" type="audio/mp4" />
      </audio>

      {/* Botón Flotante de Música */}
      <button
        onClick={toggleAudio}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/50 border border-gold/40 text-gold hover:bg-gold/20 transition backdrop-blur-md shadow-lg cursor-pointer"
        title={isPlaying ? "Silenciar música" : "Reproducir música"}
      >
        {isPlaying ? <Volume2 size={18} className="animate-bounce" /> : <VolumeX size={18} />}
        <span className="text-xs uppercase tracking-wider font-semibold hidden sm:inline">
          {isPlaying ? "Música activada" : "Música"}
        </span>
      </button>

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold mb-5 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 shadow-[0_0_15px_rgba(240,196,74,0.15)]">
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-gold" />
          ✨ Sorteo Abierto Oficial
          <span className="h-px w-9 bg-gradient-to-l from-transparent to-gold" />
        </div>

        {/* TÍTULO CON EFECTO LATIDO */}
        <h1 className="font-display text-5xl sm:text-7xl tracking-wide bg-gradient-to-b from-gold-pale via-gold to-gold-deep bg-clip-text text-transparent uppercase animate-heartbeat-glow py-2">
          Gran Sorteo
        </h1>
        
        <p className="mt-4 max-w-lg text-cream-dim text-sm sm:text-base leading-relaxed text-gray-300">
          Regístrate con tu comprobante de depósito y entra a la ronda final. Un cupo, un número de celular:
          <span className="text-gold font-semibold block mt-1">cada participante solo puede inscribirse una vez.</span>
        </p>

        {/* BOTÓN DE INSCRIPCIÓN */}
        <button
          onClick={() => setOpen(true)}
          className="group relative mt-9 inline-flex items-center gap-3 rounded-xl bg-gradient-to-b from-gold-pale via-gold to-gold-deep px-9 py-4 font-body font-bold uppercase tracking-wider text-[#2a1503] animate-pulse-box hover:scale-110 transition-all duration-300 cursor-pointer"
        >
          <span className="absolute inset-0 rounded-xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Ticket size={20} className="transform group-hover:rotate-12 transition-transform duration-300" /> 
          Inscribirme al sorteo
        </button>

        {/* TARJETAS INFORMATIVAS */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl w-full">
          <InfoCard icon={<ShieldCheck size={22} />} title="Sin duplicados" text="Un número de celular = un solo ticket." delayClass="delay-1" />
          <InfoCard icon={<Sparkles size={22} />} title="Transparente" text="El ganador se elige al azar entre los aprobados." delayClass="delay-2" />
          <InfoCard icon={<Ticket size={22} />} title="Numerado" text="Cada inscripción recibe un número consecutivo." delayClass="delay-3" />
        </div>
      </div>

      <RegistrationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function InfoCard({ icon, title, text, delayClass }) {
  return (
    <div className={`ticket-card px-6 py-6 text-left bg-black/60 border border-gold/40 backdrop-blur-md rounded-2xl animate-pulse-box ${delayClass} hover:border-gold hover:scale-105 transition-all duration-300`}>
      <div className="text-gold mb-3 p-2.5 w-fit rounded-xl bg-gold/15 border border-gold/30 shadow-[0_0_15px_rgba(240,196,74,0.3)]">{icon}</div>
      <p className="font-body font-bold text-sm text-white mb-1.5">{title}</p>
      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}