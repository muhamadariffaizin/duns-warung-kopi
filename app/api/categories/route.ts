import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  const res = await db.execute('SELECT * FROM categories ORDER BY id DESC');
  return Response.json(res.rows);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, section } = body;
  const res = await db.execute({
    sql: 'INSERT INTO categories (name, section) VALUES (?, ?)',
    args: [name, section]
  });
  return Response.json({ id: Number(res.lastInsertRowid) });
}
