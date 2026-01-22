import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const onlyActive = searchParams.get('active');

  let sql = 'SELECT p.*, c.name as category_name, c.section as category_section FROM products p LEFT JOIN categories c ON p.category_id = c.id';
  const args: any[] = [];

  if (categoryId) {
    sql += ' WHERE p.category_id = ?';
    args.push(categoryId);
  }

  if (onlyActive) {
    sql += categoryId ? ' AND p.is_active = 1' : ' WHERE p.is_active = 1';
  }

  sql += ' ORDER BY p.id DESC';

  const res = await db.execute({ sql, args });
  return Response.json(res.rows);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { category_id, name, description, price, image_url, admin_fee_pct } = body;
  const res = await db.execute({
    sql: 'INSERT INTO products (category_id, name, description, price, image_url, admin_fee_pct) VALUES (?, ?, ?, ?, ?, ?)',
    args: [category_id || null, name, description || '', Number(price || 0), image_url || '', Number(admin_fee_pct || 0)]
  });
  return Response.json({ id: Number(res.lastInsertRowid) });
}
