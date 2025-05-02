import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  selectFrom: (table: string) => ({
    innerJoin: (joinTable: string, condition: string) => ({
      select: (fields: string[]) => ({
        where: (condition: string, value: any) => ({
          orderBy: (field: string, direction: 'asc' | 'desc' = 'desc') => ({
            execute: async () => {
              const query = `
                SELECT ${fields.join(', ')}
                FROM ${table}
                INNER JOIN ${joinTable} ON ${condition}
                WHERE ${condition} = $1
                ORDER BY ${field} ${direction}
              `;
              const result = await pool.query(query, [value]);
              return result.rows;
            }
          })
        })
      })
    })
  })
}; 