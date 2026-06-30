import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// ─── Dev Mock API ─────────────────────────────────────────────────────────────
// Install the axios-mock-adapter before React renders when VITE_BYPASS_AUTH
// is enabled. Vite's build-time tree-shaking eliminates this entire block
// in production (import.meta.env values become string literals at build time).
// if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
//   const { installMockApi } = await import('./dev/mockApi');
//   installMockApi();
// }
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
