import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { sendTelegram } from '@/lib/telegram';

export async function GET(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const res = await db.execute('SELECT * FROM orders ORDER BY id DESC');
  return Response.json(res.rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    customer_name,
    phone,
    delivery_method,
    address,
    notes,
    items,
    subtotal,
    admin_fee,
    total,
    payment_method,
    proof_url
  } = body;

  const res = await db.execute({
    sql: 'INSERT INTO orders (customer_name, phone, delivery_method, address, notes, items_json, subtotal, admin_fee, total, payment_method, proof_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      customer_name,
      phone,
      delivery_method,
      address || '',
      notes || '',
      JSON.stringify(items || []),
      Number(subtotal || 0),
      Number(admin_fee || 0),
      Number(total || 0),
      payment_method,
      proof_url || ''
    ]
  });

  const orderId = Number(res.lastInsertRowid);
  const itemText = (items || []).map((i: any) => `${i.qty}x ${i.custom_label || i.name}`).join(', ');
  const message = `Pesanan Baru #${orderId}\nNama: ${customer_name}\nHP: ${phone}\nMetode: ${delivery_method}\nAlamat: ${address || '-'}\nPesanan: ${itemText}\nSubtotal: ${subtotal}\nAdmin: ${admin_fee}\nTotal: ${total}\nBayar: ${payment_method.toUpperCase()}\nBukti: ${proof_url || '-'}\nCatatan: ${notes || '-'}`;

  await sendTelegram(message);

  return Response.json({ id: orderId });
}
