import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

const api = {
  invoice: {
    list: (): Promise<unknown[]> => ipcRenderer.invoke("invoice:list"),
    create: (invoice: unknown): Promise<unknown> => ipcRenderer.invoke("invoice:create", invoice),
    update: (invoice: unknown): Promise<unknown> => ipcRenderer.invoke("invoice:update", invoice),
    delete: (id: string): Promise<void> => ipcRenderer.invoke("invoice:delete", id),
  },
  print: {
    toPDF: (fileName: string): Promise<{ success: boolean; filePath?: string; error?: string }> =>
      ipcRenderer.invoke("print:toPDF", fileName),
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
