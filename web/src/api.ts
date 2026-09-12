// Apunta a la edge function `pokerface-app` del proyecto Supabase.
// La ANON_KEY es pública por diseño (es la "anon key" de Supabase, pensada
// para usarse desde el cliente); el acceso real de cada jugador se valida
// del lado del servidor con `x-telegram-init-data`.
const API_URL = 'https://pumviyzvhtxaqitfttub.supabase.co/functions/v1/pokerface-app';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bXZpeXp2aHR4YXFpdGZ0dHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTM2MzYsImV4cCI6MjEwNDcyOTYzNn0.njK5eRpV9BX4jSY7BF7ByycrJ0cgmABPe7C-S66epEI';

export function getTelegram() {
  return window.Telegram?.WebApp;
}

export function getGameIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('game');
}

class ApiError extends Error {}

async function call<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const tg = getTelegram();
  const initData = tg?.initData ?? '';
  const game = getGameIdFromUrl();

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: ANON_KEY,
      'x-telegram-init-data': initData,
    },
    body: JSON.stringify({ path, game, ...body }),
  });

  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new ApiError(data?.error ?? `Error ${res.status}`);
  }
  return data as T;
}

export { ApiError };

export function fetchState<T>() {
  return call<T>('state');
}

export function sendAction<T>(action: string, amount = 0) {
  return call<T>('action', { action, amount });
}
