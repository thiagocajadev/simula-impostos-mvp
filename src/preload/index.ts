import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

const api = {
  nf: {
    list: (): Promise<unknown[]> => ipcRenderer.invoke("nf:list"),
    create: (nf: unknown): Promise<unknown> => ipcRenderer.invoke("nf:create", nf),
    update: (nf: unknown): Promise<unknown> => ipcRenderer.invoke("nf:update", nf),
    delete: (id: string): Promise<void> => ipcRenderer.invoke("nf:delete", id),
  },
  print: {
    toPDF: (
      nomeArquivo: string,
    ): Promise<{ success: boolean; filePath?: string; error?: string }> =>
      ipcRenderer.invoke("print:toPDF", nomeArquivo),
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.api = api;
}
