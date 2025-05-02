interface Env {
  DB: D1Database;
}

export const createDb = (env: Env) => ({
  query: async (text: string, params?: any[]) => {
    try {
      const stmt = await env.DB.prepare(text);
      if (params && params.length > 0) {
        return await stmt.bind(...params).all();
      }
      return await stmt.all();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
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
                WHERE ${condition} = ?
                ORDER BY ${field} ${direction}
              `;
              const result = await env.DB.prepare(query).bind(value).all();
              return result.results;
            }
          })
        })
      })
    })
  })
}); 