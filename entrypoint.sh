#!/bin/sh
set -e

echo "Starting application..."
echo "PWD: $(pwd)"
echo "Files in current directory:"
ls -la /usr/share/caddy | head -20

# Generate env.js with environment variables from Railway
echo "Generating env.js with API_URL: ${API_URL:-https://cvplus-passes-admin-production.up.railway.app}"
cat > /usr/share/caddy/env.js << EOF
window.appConfig = {
  apiUrl: '${API_URL:-https://cvplus-passes-admin-production.up.railway.app}'
};
EOF

echo "env.js content:"
cat /usr/share/caddy/env.js

# Execute the main command
echo "Starting Caddy..."
exec "$@"
