#!/bin/sh
set -e

# Generate env.js with environment variables from Railway
cat > /usr/share/caddy/env.js << EOF
window.appConfig = {
  apiUrl: '${API_URL:-https://cvplus-passes-admin-production.up.railway.app}'
};
EOF

# Execute the main command
exec "$@"
