# PokerFace — frontend (React + TypeScript + Vite)

Reemplaza el `docs/index.html` original (JS vanilla en un solo archivo) por
componentes de React tipados. La lógica es la misma: lee `initData` del
Telegram WebApp SDK y el `game` de la URL, y llama a la edge function
`pokerface-app` de Supabase (`state` para leer, `action` para jugar).

```
src/
  api.ts              cliente de la API + helpers de Telegram
  types.ts            tipos del estado del juego
  App.tsx             polling del estado y manejo de acciones
  components/
    Table.tsx          bote, cartas comunitarias, asientos, mano propia
    Seat.tsx            un asiento de jugador
    ActionDock.tsx       fold / check / call / all-in / bet-raise
    PlayingCard.tsx      carta individual
    StatusScreen.tsx    pantallas de "conectando", error, etc.
```

## Requisitos

Node 18+ y npm.

## Desarrollo local

```bash
npm install
npm run dev
```

Nota: fuera de Telegram no hay `initData`, así que vas a ver la pantalla
"Abre esto desde Telegram". Para probar de verdad, mejor compilar y abrir
la URL publicada desde el botón "🎮 Jugar" del bot.

## Build

```bash
npm run build
```

Genera `dist/` con las rutas de los assets apuntando a `/PokerFace/`
(configurado en `vite.config.ts` como `base`). Si el repo de GitHub tiene
otro nombre, cambia ese `base` antes de compilar (debe empezar y terminar
con `/`).

## Deploy manual a GitHub Pages

Tu repo (`hortechoco/PokerFace`) ya sirve la miniapp en
`https://hortechoco.github.io/PokerFace/`. Según cómo esté configurado
GitHub Pages en el repo (Settings → Pages), hay dos caminos:

**A) Pages sirviendo la carpeta `/docs` de `main`** (como está ahora)

```bash
npm run build
rm -rf ../docs
cp -r dist ../docs
git add ../docs
git commit -m "Actualiza frontend de la miniapp"
git push
```

(ajusta las rutas `../docs` según dónde clones este proyecto respecto a la
raíz del repo).

**B) Pages sirviendo la rama `gh-pages`**

Usa el script incluido, que empaqueta `dist/` y la publica en esa rama:

```bash
npm install
npm run build
npm run deploy
```

Esto usa el paquete `gh-pages` y necesita que el remoto `origin` de git
apunte a tu repo con permisos de push. Si cambias a esta opción, en
Settings → Pages selecciona la rama `gh-pages` como fuente.

## Si cambia la URL de la API o el proyecto de Supabase

`API_URL` y `ANON_KEY` están al inicio de `src/api.ts`. La `ANON_KEY` es la
"anon key" pública de Supabase (no es secreta, la validación real de cada
jugador ocurre en el servidor vía `x-telegram-init-data`).
