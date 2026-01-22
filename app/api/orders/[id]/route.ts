import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { status, proof_url } = body;

  await db.execute({
    sql: 'UPDATE orders SET status = ?, proof_url = ? WHERE id = ?',
    args: [status, proof_url || '', params.id]
  });

  return Response.json({ ok: true });
}
