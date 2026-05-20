/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      nf: {
        list: () => Promise<unknown[]>;
        create: (nf: unknown) => Promise<unknown>;
        update: (nf: unknown) => Promise<unknown>;
        delete: (id: string) => Promise<void>;
      };
      print: {
        toPDF: (
          nomeArquivo: string,
        ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      };
    };
  }
}

export {};
