import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ ok: false, error: 'DATABASE_URL não configurada' });
    }
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as now`;
    return res.status(200).json({ ok: true, timestamp: result[0]?.now ?? null });
  } catch (error) {
    console.error('health check falhou:', error);
    return res.status(500).json({ ok: false, error: 'Falha ao verificar conexão com o banco' });
  }
}