const path = require("node:path");

/**
 * PM2 Production Configuration for Mek Engineering Corporation (mekengg.com)
 * Process Name: mekeng | Port: 3600
 *
 * Usage:
 *   chmod +x setup.sh && ./setup.sh
 *   -- or manually:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: "mekeng",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      // Single fork process guarantees zero cross-process SQLite writer lock contention
      // while async Node I/O + libSQL WAL handles concurrent HTTP traffic smoothly.
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "750M",
      env: {
        NODE_ENV: "production",
        PORT: 3600,
        HOSTNAME: "127.0.0.1",
        NEXT_PUBLIC_SITE_URL: "https://mekengg.com",
        AUTH_TRUST_HOST: "true",
        DATABASE_PATH: path.join(__dirname, "data", "mekengineering.db"),
      },
    },
  ],
};
