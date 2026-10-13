const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id?: string): void;
  remove(id?: string): void;
}

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  const w = window as unknown as { turnstile?: TurnstileApi };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  if (!loading) {
    loading = new Promise<TurnstileApi>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => (w.turnstile ? resolve(w.turnstile) : reject(new Error('turnstile')));
      s.onerror = () => {
        loading = null;
        reject(new Error('turnstile'));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/** Pinta el widget de Cloudflare Turnstile y devuelve una función para reiniciarlo/quitarlo. */
export async function renderTurnstile(
  host: HTMLElement,
  siteKey: string,
  onToken: (token: string | null) => void
): Promise<{ reset: () => void; remove: () => void }> {
  const api = await loadTurnstile();
  const id = api.render(host, {
    sitekey: siteKey,
    language: 'es',
    callback: (t: string) => onToken(t),
    'expired-callback': () => onToken(null),
    'error-callback': () => onToken(null)
  });
  return {
    reset: () => {
      onToken(null);
      api.reset(id);
    },
    remove: () => api.remove(id)
  };
}
