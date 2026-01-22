import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, description, price, image_url, is_active, category_id, admin_fee_pct } = body;
  await db.execute({
    sql: 'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, is_active = ?, category_id = ?, admin_fee_pct = ? WHERE id = ?',
    args: [name, description || '', Number(price || 0), image_url || '', is_active ? 1 : 0, category_id || null, Number(admin_fee_pct || 0), params.id]
  });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  await db.execute({
    sql: 'DELETE FROM products WHERE id = ?',
    args: [params.id]
  });
  return Response.json({ ok: true });
}
