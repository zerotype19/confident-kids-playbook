declare module '@db' {
  export const db: {
    prepare: (sql: string) => {
      bind: (...params: any[]) => {
        first: <T>() => Promise<T | null>;
        all: <T>() => Promise<{ results: T[] }>;
      };
    };
  };
} 