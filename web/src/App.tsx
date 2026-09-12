import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, fetchState, getGameIdFromUrl, getTelegram, sendAction } from './api';
import type { ActionKind, StateResponse } from './types';
import { StatusScreen } from './components/StatusScreen';
import { Table } from './components/Table';
import { ActionDock } from './components/ActionDock';

const POLL_MS = 1500;

export default function App() {
  const [state, setState] = useState<StateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    const tg = getTelegram();
    tg?.ready();
    tg?.expand();
    setReady(true);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await fetchState<StateResponse>();
      setState(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo conectar con la mesa.');
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const tg = getTelegram();
    if (!tg?.initData || !getGameIdFromUrl()) return;

    load();
    pollRef.current = window.setInterval(load, POLL_MS);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [ready, load]);

  const handleAction = async (action: ActionKind, amount = 0) => {
    setBusy(true);
    try {
      await sendAction(action, amount);
      getTelegram()?.HapticFeedback?.impactOccurred('light');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo procesar la acción.');
      getTelegram()?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  const tg = getTelegram();
  if (!tg?.initData) {
    return (
      <StatusScreen
        glyph="♠"
        title="Abre esto desde Telegram"
        message="Esta mesa solo funciona dentro del bot de PokerFace."
      />
    );
  }

  if (!getGameIdFromUrl()) {
    return (
      <StatusScreen
        glyph="⏳"
        title="Sin partida activa"
        message="Vuelve al chat con el bot y pulsa /start cuando tu mesa haya comenzado."
      />
    );
  }

  if (error && !state) {
    return <StatusScreen glyph="⚠" title="Algo salió mal" message={error} />;
  }

  if (!state) {
    return <StatusScreen glyph="♣" title="Conectando…" />;
  }

  const { game, hand } = state;
  const isMyTurn = state.me.seat_number === game.current_seat;
  const toCall = Math.max(0, game.current_bet - (hand?.round_contributed ?? 0));
  const isBetting = game.current_bet === 0;
  const minRaise = isBetting ? game.big_blind : game.current_bet + game.big_blind;

  return (
    <div className="app">
      <Table state={state} />
      <ActionDock
        visible={isMyTurn}
        toCall={toCall}
        isBetting={isBetting}
        minRaise={minRaise}
        busy={busy}
        onAction={handleAction}
      />
      <div className="toast">{error}</div>
    </div>
  );
}
