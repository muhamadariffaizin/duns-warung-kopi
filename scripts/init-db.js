const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

(async () => {
  const client = createClient({ url, authToken });
  await client.executeMultiple(schema);
  console.log('Database initialized.');
})();
