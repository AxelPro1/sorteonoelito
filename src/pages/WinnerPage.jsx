import { useCallback, useEffect, useRef, useState } from 'react';
import { Dices, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import client from '../api/client.js';

export default function WinnerPage() {
  const [eligible, setEligible] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [ticketLabel, setTicketLabel] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultTone, setResultTone] = useState('info'); // info | win | error
  const [history, setHistory] = useState([]);

  const timerRef = useRef(null);
  const pendingWinnerRef = useRef(null);
  const eligibleRef = useRef([]);

  useEffect(() => {
    eligibleRef.current = eligible;
  }, [eligible]);

  const loadEligible = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const { data } = await client.get('/admin/participants', {
        params: { status: 'aprobado', limit: 100 }
      });
      setEligible(data.data.filter((p) => !p.isWinner));
    } catch (err) {
      setListError(err.response?.data?.message || 'No se pudo cargar la lista de elegibles');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await client.get('/admin/winner');
      setHistory(data.data);
    } catch {
      // silencioso: el historial no es crítico para poder sortear
    }
  }, []);

  useEffect(() => {
    loadEligible();
    loadHistory();
    return () => clearTimeout(timerRef.current);
  }, [loadEligible, loadHistory]);

  // Regla obligatoria: en el reel SOLO se muestra el nombre del participante (fullName),
  // nunca el nombre de la cuenta del depositante (accountName).
  const randomName = () => {
    const list = eligibleRef.current;
    if (list.length === 0) return '';
    return list[Math.floor(Math.random() * list.length)].fullName;
  };

  const spinStep = (delay) => {
    setDisplayName(randomName());
    timerRef.current = setTimeout(() => spinStep(delay), delay);
  };

  const finalize = (winner) => {
    clearTimeout(timerRef.current);
    setDisplayName(winner.fullName);
    setTicketLabel(`TICKET #${winner.ticketNumber}`);
    setSpinning(false);
    setLanded(true);
    setResultMsg(`🏆 Ganador: ${winner.fullName} — Ticket #${winner.ticketNumber}`);
    setResultTone('win');
    setEligible((list) => list.filter((p) => p.fullName !== winner.fullName || p.ticketNumber !== winner.ticketNumber));
    setHistory((h) => [
      { _id: `${winner.ticketNumber}-${Date.now()}`, participant: winner, createdAt: new Date().toISOString() },
      ...h
    ]);
    pendingWinnerRef.current = null;
  };

  const decelerateToWinner = (winner) => {
    clearTimeout(timerRef.current);
    const steps = [70, 90, 120, 160, 210, 270, 340];
    let i = 0;
    const tick = () => {
      if (i < steps.length) {
        setDisplayName(randomName());
        timerRef.current = setTimeout(tick, steps[i]);
        i += 1;
      } else {
        finalize(winner);
      }
    };
    tick();
  };

  const girar = async () => {
    if (spinning || eligible.length === 0) return;
    setSpinning(true);
    setLanded(false);
    setResultMsg('');
    pendingWinnerRef.current = null;
    setTicketLabel('');
    spinStep(55);

    try {
      const { data } = await client.post('/admin/winner/draw', {
        notes: 'Sorteo realizado desde el panel React'
      });
      const winner = {
        fullName: data.data.participant.fullName,
        ticketNumber: data.data.participant.ticketNumber
      };
      pendingWinnerRef.current = winner;
      setTimeout(() => decelerateToWinner(winner), 900);
    } catch (err) {
      clearTimeout(timerRef.current);
      setSpinning(false);
      setResultMsg(err.response?.data?.message || 'No se pudo sortear un ganador');
      setResultTone('error');
    }
  };

  const detener = () => {
    if (!spinning) return;
    if (pendingWinnerRef.current) {
      decelerateToWinner(pendingWinnerRef.current);
    } else {
      setResultMsg('Confirmando ganador con el servidor…');
      setResultTone('info');
    }
  };

  const limpiar = () => {
    clearTimeout(timerRef.current);
    setSpinning(false);
    setLanded(false);
    setDisplayName('');
    setTicketLabel('');
    setResultMsg('');
    pendingWinnerRef.current = null;
  };

  return (
    <div>
      <header className="mb-7 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold mb-1.5">
            Acceso restringido · Administrador
          </div>
          <h1 className="font-display text-2xl tracking-wide text-gold-pale">Módulo de Sorteo</h1>
          <p className="text-sm text-cream-dim mt-1">
            Selecciona al ganador entre los participantes con depósito aprobado
          </p>
        </div>
        <button
          onClick={loadEligible}
          className="inline-flex items-center gap-2 rounded-lg border border-gold-deep/30 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-gold-pale hover:bg-white/5"
        >
          <RefreshCw size={14} /> Recargar elegibles
        </button>
      </header>

      {listError && (
        <p className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle size={15} /> {listError}
        </p>
      )}

      {/* --- gabinete de la máquina --- */}
      <div
        className="relative rounded-[22px] p-7 border border-gold-deep/25 shadow-2xl"
        style={{ background: 'linear-gradient(180deg, #4a1410, #24080a 60%, #170504)' }}
      >
        <div className="absolute inset-2 rounded-[16px] border border-gold-deep/35 pointer-events-none" />

        <p className="text-center font-mono text-xs text-gold-pale tracking-wide mb-4">
          {loadingList ? 'Cargando participantes…' : `${eligible.length} participante(s) elegible(s)`}
        </p>

        <div
          className={`relative rounded-xl border-[3px] border-gold-deep h-[150px] flex items-center justify-center overflow-hidden ${
            landed ? 'animate-jackpot' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #05130d, #0a2018 55%, #05130d)',
            boxShadow: 'inset 0 10px 24px rgba(0,0,0,.65), inset 0 -10px 24px rgba(0,0,0,.5), 0 0 0 6px rgba(0,0,0,.35)'
          }}
        >
          <span className="absolute top-2.5 right-3.5 font-mono text-[11px] text-gold-deep tracking-wide">
            {ticketLabel}
          </span>

          {displayName ? (
            <span
              className={`font-display text-3xl sm:text-4xl text-gold-pale text-center px-5 truncate ${
                spinning ? 'blur-[1.5px] opacity-90' : ''
              }`}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,.6)' }}
            >
              {displayName}
            </span>
          ) : (
            <span className="text-cream/30 text-sm uppercase tracking-[0.15em] font-body px-5 text-center">
              Presiona GIRAR para iniciar el sorteo
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <button
            onClick={girar}
            disabled={spinning || eligible.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-pale via-gold to-gold-deep px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#2a1503] shadow-[0_5px_0_#7a5510] active:translate-y-0.5 active:shadow-[0_2px_0_#7a5510] disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
          >
            <Dices size={17} /> Girar
          </button>
          <button
            onClick={detener}
            disabled={!spinning}
            className="rounded-lg bg-gradient-to-b from-red-400 via-crimson to-red-900 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream shadow-[0_5px_0_#4d0e0e] active:translate-y-0.5 active:shadow-[0_2px_0_#4d0e0e] disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
          >
            Detener
          </button>
          <button
            onClick={limpiar}
            className="rounded-lg bg-gradient-to-b from-neutral-600 to-neutral-900 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream-dim shadow-[0_5px_0_#0a0a0a] active:translate-y-0.5 active:shadow-[0_2px_0_#0a0a0a] transition-transform"
          >
            Limpiar
          </button>
        </div>

        {resultMsg && (
          <p
            className={`text-center mt-5 text-sm ${
              resultTone === 'win' ? 'font-mono text-gold-pale' : resultTone === 'error' ? 'text-red-300' : 'text-cream-dim'
            }`}
          >
            {resultMsg}
          </p>
        )}
      </div>

      {/* --- historial --- */}
      <div className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-cream-dim border-b border-gold-deep/20 pb-2 mb-1 flex items-center gap-2">
          <Trophy size={14} className="text-gold" /> Historial de sorteos
        </h2>
        {history.length === 0 ? (
          <p className="text-center text-sm text-cream-dim py-5">Aún no se han registrado sorteos.</p>
        ) : (
          history.map((w) => (
            <div
              key={w._id}
              className="flex items-center justify-between py-2.5 border-b border-dashed border-gold-deep/10 font-mono text-xs"
            >
              <span className="text-cream">
                {new Date(w.createdAt).toLocaleString('es-BO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                {' · '}
                Ticket #{w.participant?.ticketNumber} · {w.participant?.fullName}
              </span>
              <span className="text-cream-dim">ganador</span>
            </div>
          ))
        )}
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-cream-dim max-w-lg mx-auto">
        Mientras la ruleta gira solo se muestra el <b className="text-gold-deep">nombre del participante</b>. El
        nombre de la cuenta del depositante (usado únicamente para conciliar el comprobante de pago en la sección
        de Depósitos) nunca se exhibe en este módulo. Esta página solo debe ser accesible dentro del panel de
        administrador autenticado.
      </p>
    </div>
  );
}
