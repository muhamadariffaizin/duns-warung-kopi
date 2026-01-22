'use client';

import { useEffect, useState } from 'react';

type Category = { id: number; name: string; section: string };

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  admin_fee_pct: number;
  is_active: number;
};

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  delivery_method: string;
  address: string;
  items_json: string;
  total: number;
  status: string;
  created_at: string;
  proof_url: string;
};

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [newCategory, setNewCategory] = useState({ name: '', section: 'coffee' });
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, category_id: '', admin_fee_pct: 0 });

  const headers = key ? { 'x-admin-key': key, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const load = async () => {
    const c = await fetch('/api/categories').then(r => r.json());
    const p = await fetch('/api/products').then(r => r.json());
    const o = await fetch('/api/orders', { headers }).then(r => r.json());
    setCategories(c);
    setProducts(p);
    if (Array.isArray(o)) setOrders(o);
  };

  useEffect(() => { load(); }, [key]);

  const addCategory = async () => {
    await fetch('/api/categories', { method: 'POST', headers, body: JSON.stringify(newCategory) });
    setNewCategory({ name: '', section: 'coffee' });
    load();
  };

  const addProduct = async () => {
    await fetch('/api/products', { method: 'POST', headers, body: JSON.stringify({
      ...newProduct,
      price: Number(newProduct.price || 0),
      admin_fee_pct: Number(newProduct.admin_fee_pct || 0),
      category_id: newProduct.category_id || null
    }) });
    setNewProduct({ name: '', description: '', price: 0, category_id: '', admin_fee_pct: 0 });
    load();
  };

  const updateProduct = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, { method: 'PUT', headers, body: JSON.stringify(p) });
    load();
  };

  const removeProduct = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers });
    load();
  };

  const updateOrder = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
    load();
  };

  return (
    <main className="container admin">
      <h1>Admin Duns Warung Kopi</h1>
      <p>Masukkan ADMIN_KEY untuk mengelola data.</p>
      <input placeholder="ADMIN_KEY" value={key} onChange={e => setKey(e.target.value)} />

      <section>
        <h2>Tambah Kategori</h2>
        <input placeholder="Nama kategori" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} />
        <select value={newCategory.section} onChange={e => setNewCategory({ ...newCategory, section: e.target.value })}>
          <option value="coffee">Kopi</option>
          <option value="drink">Minuman</option>
          <option value="food">Makanan</option>
          <option value="ppob">PPOB</option>
        </select>
        <button className="btn" onClick={addCategory}>Simpan</button>
      </section>

      <section>
        <h2>Tambah Produk</h2>
        <input placeholder="Nama" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
        <input placeholder="Deskripsi" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
        <input placeholder="Harga" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
        <select value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}>
          <option value="">Pilih kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Admin fee (contoh 0.05)" type="number" step="0.01" value={newProduct.admin_fee_pct} onChange={e => setNewProduct({ ...newProduct, admin_fee_pct: Number(e.target.value) })} />
        <button className="btn" onClick={addProduct}>Simpan</button>
      </section>

      <section>
        <h2>Daftar Produk</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>
                  <select value={p.is_active ? '1' : '0'} onChange={e => updateProduct({ ...p, is_active: e.target.value === '1' ? 1 : 0 })}>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </td>
                <td>
                  <button className="btn secondary" onClick={() => removeProduct(p.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Pesanan</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Bukti</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.total}</td>
                <td>{o.status}</td>
                <td>{o.proof_url ? <a href={o.proof_url} target="_blank">Lihat</a> : '-'}</td>
                <td>
                  <select value={o.status} onChange={e => updateOrder(o.id, e.target.value)}>
                    <option value="waiting_payment">Menunggu pembayaran</option>
                    <option value="paid">Sudah dibayar</option>
                    <option value="processing">Diproses</option>
                    <option value="delivered">Dikirim/selesai</option>
                    <option value="canceled">Dibatalkan</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
