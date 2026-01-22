export function isAdmin(req: Request) {
  const adminKey = process.env.ADMIN_KEY || '';
  const header = req.headers.get('x-admin-key') || '';
  return adminKey && header && header === adminKey;
}
