declare module 'hono' {
  export interface Context {
    req: {
      query: (key: string) => string | undefined;
    };
    json: (data: any, status?: number) => Response;
  }
} 