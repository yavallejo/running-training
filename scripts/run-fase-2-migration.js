/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Apply fase-2-migration.sql to Supabase using the service role key.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/run-fase-2-migration.js
 *
 * The SQL file is read and executed as a single statement via the
 * Postgres REST endpoint. Multi-statement migrations require splitting
 * or using psql; this runner is a thin wrapper for convenience.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, 'fase-2-migration.sql'),
  'utf8'
);

const url = new URL('/pg/query', supabaseUrl);

const body = JSON.stringify({ query: sql });

const req = https.request(
  {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log(data);
      if (res.statusCode >= 400) process.exit(1);
    });
  }
);

req.on('error', (err) => {
  console.error('Request failed:', err);
  process.exit(1);
});

req.write(body);
req.end();
