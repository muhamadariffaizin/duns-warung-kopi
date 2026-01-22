const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const data = {
  categories: [
    { name: 'Kopi', section: 'coffee' },
    { name: 'Minuman', section: 'drink' },
    { name: 'Makanan', section: 'food' },
    { name: 'PPOB', section: 'ppob' }
  ],
  products: [
    { name: 'Kopi Susu Gula Aren', description: 'Espresso, susu, gula aren', price: 18000, category: 'Kopi' },
    { name: 'Americano', description: 'Espresso & air', price: 15000, category: 'Kopi' },
    { name: 'Teh Lemon', description: 'Teh segar dengan lemon', price: 12000, category: 'Minuman' },
    { name: 'Nasi Ayam Sambal', description: 'Nasi, ayam, sambal', price: 25000, category: 'Makanan' },
    { name: 'Top Up E-Wallet', description: 'Dana/OVO/GoPay/LinkAja', price: 0, category: 'PPOB', admin_fee_pct: 0.05 }
  ]
};

(async () => {
  const client = createClient({ url, authToken });

  const categoryIds = {};
  for (const c of data.categories) {
    const res = await client.execute({
      sql: 'INSERT INTO categories (name, section) VALUES (?, ?)',
      args: [c.name, c.section]
    });
    categoryIds[c.name] = Number(res.lastInsertRowid);
  }

  for (const p of data.products) {
    await client.execute({
      sql: 'INSERT INTO products (category_id, name, description, price, admin_fee_pct) VALUES (?, ?, ?, ?, ?)',
      args: [categoryIds[p.category], p.name, p.description, p.price, p.admin_fee_pct || 0]
    });
  }

  console.log('Seed completed.');
})();
