import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      invoice: {
        list: () => Promise<unknown[]>;
        create: (invoice: unknown) => Promise<unknown>;
        update: (invoice: unknown) => Promise<unknown>;
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
