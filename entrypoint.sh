#!/bin/sh
set -e

echo "Starting application..."
echo "PWD: $(pwd)"
echo "Files in current directory:"
ls -la /usr/share/caddy | head -20

# Generate env.js with environment variables from Railway.
# Los valores se escapan para que una comilla o barra no rompa el JavaScript.
esc() { printf '%s' "$1" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g"; }

echo "Generating env.js with API_URL: ${API_URL:-https://cvplus-passes-admin-production.up.railway.app}"
cat > /usr/share/caddy/env.js << EOF
window.appConfig = {
  apiUrl: '$(esc "${API_URL:-https://cvplus-passes-admin-production.up.railway.app}")',
  supportPhone: '$(esc "${SUPPORT_PHONE:-}")',
  supportWhatsapp: '$(esc "${SUPPORT_WHATSAPP:-}")',
  termsUrl: '$(esc "${TERMS_URL:-}")',
  privacyUrl: '$(esc "${PRIVACY_URL:-}")',
  turnstileSiteKey: '$(esc "${TURNSTILE_SITE_KEY:-}")'
};
EOF

echo "env.js content:"
cat /usr/share/caddy/env.js

# Execute the main command
echo "Starting Caddy..."
exec "$@"
