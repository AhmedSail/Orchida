import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getClients() {
    const rows = await sql`SELECT * FROM clients`;
    return rows;
}