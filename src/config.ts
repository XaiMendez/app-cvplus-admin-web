export const config = {
  apiUrl: (window as any).appConfig?.apiUrl || 'https://cvplus-passes-admin-production.up.railway.app',
  // Configurar en appConfig: { supportPhone: '503XXXXXXXX', supportWhatsapp: 'https://wa.me/503XXXXXXXX', termsUrl: 'https://...', privacyUrl: 'https://...' }
  supportPhone: (window as any).appConfig?.supportPhone || '',
  supportWhatsapp: (window as any).appConfig?.supportWhatsapp || '',
  termsUrl: (window as any).appConfig?.termsUrl || '#',
  privacyUrl: (window as any).appConfig?.privacyUrl || '#',
  // Clave pública de Cloudflare Turnstile. Si está vacía, no se muestra CAPTCHA (el backend debe tener TURNSTILE_SECRET vacío también).
  turnstileSiteKey: (window as any).appConfig?.turnstileSiteKey || ''
};
