import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      nf: {
        list: () => Promise<unknown[]>;
        create: (nf: unknown) => Promise<unknown>;
        update: (nf: unknown) => Promise<unknown>;
        delete: (id: string) => Promise<void>;
      };
      print: {
        toPDF: (
          fileName: string,
        ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      };
    };
  }
}
