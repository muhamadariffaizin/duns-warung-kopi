'use client';

import { useEffect, useMemo, useState } from 'react';
import { config } from '@/lib/config';

type Category = { id: number; name: string; section: string };
type Product = { id: number; name: string; description: string; price: number; category_id: number; category_name: string; category_section: string; admin_fee_pct: number };
type CartItem = Product & { qty: number; cart_key: string; custom_label?: string; custom_amount?: number };

const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSection, setActiveSection] = useState('coffee');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', delivery: 'pickup', address: '', notes: '' });
  const [payment, setPayment] = useState('qris');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ppobInputs, setPpobInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
    fetch('/api/products?active=1').then(r => r.json()).then(setProducts);
    const saved = localStorage.getItem('dwk-cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('dwk-cart', JSON.stringify(cart));
  }, [cart]);

  const sections = useMemo(() => {
    const map = new Map();
    categories.forEach(c => map.set(c.section, c.section));
    if (!map.size) return ['coffee', 'drink', 'food', 'ppob'];
    return Array.from(map.keys());
  }, [categories]);

  const sectionLabels: Record<string, string> = {
    coffee: 'Kopi',
    drink: 'Minuman',
    food: 'Makanan',
    ppob: 'PPOB'
  };

  const filteredProducts = products.filter(p => p.category_section === activeSection);

  const addToCart = (p: Product) => {
    let price = p.price;
    let customLabel: string | undefined;
    let customAmount: number | undefined;

    if (p.price === 0) {
      const input = ppobInputs[p.id] || '';
      const parsed = Number(String(input).replace(/[^0-9]/g, ''));
      if (!parsed || parsed <= 0) return;
      price = parsed;
      customAmount = parsed;
      customLabel = `${p.name} (${currency(parsed)})`;
    }

    const cartKey = `${p.id}:${customAmount || ''}`;

    setCart(prev => {
      const existing = prev.find(i => i.cart_key === cartKey);
      if (existing) return prev.map(i => i.cart_key === cartKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1, price, cart_key: cartKey, custom_label: customLabel, custom_amount: customAmount }];
    });
  };

  const removeFromCart = (cartKey: string) => {
    setCart(prev => prev.map(i => i.cart_key === cartKey ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const adminFee = cart.reduce((sum, item) => sum + (item.admin_fee_pct ? item.price * item.qty * item.admin_fee_pct : 0), 0);
  const total = subtotal + adminFee;

  const submitOrder = async () => {
    let proofUrl = '';

    if (proofFile) {
      setUploading(true);
      const form = new FormData();
      form.append('file', proofFile);
      const resUpload = await fetch('/api/proof', { method: 'POST', body: form });
      const dataUpload = await resUpload.json();
      proofUrl = dataUpload.url || '';
      setUploading(false);
    }

    const order = {
      customer_name: customer.name,
      phone: customer.phone,
      delivery_method: customer.delivery,
      address: customer.address,
      notes: customer.notes,
      items: cart,
      subtotal,
      admin_fee: Math.round(adminFee),
      total: Math.round(total),
      payment_method: payment,
      proof_url: proofUrl
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();

    const summary = cart.map(i => `${i.qty}x ${i.custom_label || i.name}`).join(', ');
    const msg = `Halo Admin ${config.storeName},\n\nSaya sudah melakukan pembayaran. Berikut detail pesanan saya:\nNama: ${customer.name}\nHP: ${customer.phone}\nMetode: ${customer.delivery}\nAlamat: ${customer.address || '-'}\nPesanan: ${summary}\nSubtotal: ${currency(subtotal)}\nAdmin Fee: ${currency(Math.round(adminFee))}\nTotal: ${currency(Math.round(total))}\nMetode Bayar: ${payment.toUpperCase()}\nOrder ID: ${data.id}\n\nTerima kasih.`;

    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    setProofFile(null);
  };

  return (
    <main className="container">
      <div className="hero">
        <div>
          <img src="/logo.svg" alt="logo" width={70} height={70} />
          <h1>{config.storeName}</h1>
          <p>Warung kopi modern dengan menu kopi, minuman, makanan, dan PPOB. Order cepat, bayar QRIS/ewallet, kirim bukti via WhatsApp.</p>
          <div className="badges">
            <div className="badge">QRIS Ready</div>
            <div className="badge">Delivery Manual</div>
            <div className="badge">PPOB +5% Admin</div>
          </div>
        </div>
        <div>
          <div className="card">
            <div style={{ fontWeight: 800 }}>Pembayaran</div>
            <p>QRIS: scan melalui aplikasi pembayaran favorit.</p>
            <img src={config.qrisImage} alt="QRIS" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)' }} />
            <p>E-Wallet: {config.ewalletInfo}</p>
          </div>
        </div>
      </div>

      <div className="section-title">Menu</div>
      <div className="tabs">
        {sections.map((s: string) => (
          <button key={s} className={`tab ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)}>
            {sectionLabels[s] || s}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 16 }}>
        <div className="grid">
          {filteredProducts.map(p => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="price">{p.price ? currency(p.price) : 'Input nominal'}{p.admin_fee_pct ? ' + admin' : ''}</div>
              {p.price === 0 && (
                <input
                  placeholder="Nominal"
                  value={ppobInputs[p.id] || ''}
                  onChange={e => setPpobInputs({ ...ppobInputs, [p.id]: e.target.value })}
                />
              )}
              <button className="btn" onClick={() => addToCart(p)}>Tambah</button>
            </div>
          ))}
        </div>

        <div className="cart">
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Keranjang</div>
          <ul>
            {cart.map(item => (
              <li key={item.cart_key} className="cart-item">
                <div>{item.qty}x {item.custom_label || item.name}</div>
                <div>
                  <button className="btn secondary" onClick={() => removeFromCart(item.cart_key)}>-</button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, fontSize: 13 }}>Subtotal: {currency(subtotal)}</div>
          <div style={{ fontSize: 13 }}>Admin fee: {currency(Math.round(adminFee))}</div>
          <div style={{ fontWeight: 800 }}>Total: {currency(Math.round(total))}</div>

          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <input placeholder="Nama" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
            <input placeholder="No HP" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
            <select value={customer.delivery} onChange={e => setCustomer({ ...customer, delivery: e.target.value })}>
              <option value="pickup">Ambil di tempat</option>
              <option value="delivery">Delivery (diatur admin)</option>
            </select>
            {customer.delivery === 'delivery' && (
              <textarea placeholder="Alamat" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
            )}
            <textarea placeholder="Catatan" value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} />
            <select value={payment} onChange={e => setPayment(e.target.value)}>
              <option value="qris">QRIS</option>
              <option value="ewallet">E-Wallet</option>
            </select>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Upload bukti pembayaran (opsional)</label>
            <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} />
            <button className="btn" onClick={submitOrder} disabled={!cart.length || !customer.name || !customer.phone || uploading}>
              {uploading ? 'Mengupload...' : 'Kirim Pesanan'}
            </button>
          </div>
        </div>
      </div>

      <div className="footer">*Pesanan delivery diatur manual oleh admin. Admin akan konfirmasi via WhatsApp.</div>

      <div className="bottom-nav">
        <button className="active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Beranda</button>
        <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>Menu</button>
        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Bantuan</button>
      </div>
    </main>
  );
}
