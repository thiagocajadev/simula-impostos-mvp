import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";

const getDataFile = (): string => join(app.getPath("userData"), "notas-fiscais.json");

function loadNotas(): unknown[] {
  const file = getDataFile();
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function saveNotas(notas: unknown[]): void {
  writeFileSync(getDataFile(), JSON.stringify(notas, null, 2), "utf-8");
}

ipcMain.handle("nf:list", () => loadNotas());

ipcMain.handle("nf:create", (_event, nf: { id: string }) => {
  const notas = loadNotas();
  notas.push(nf);
  saveNotas(notas);
  return nf;
});

ipcMain.handle("nf:update", (_event, nf: { id: string }) => {
  const notas = loadNotas() as { id: string }[];
  const idx = notas.findIndex((n) => n.id === nf.id);
  if (idx >= 0) notas[idx] = nf;
  else notas.push(nf);
  saveNotas(notas);
  return nf;
});

ipcMain.handle("nf:delete", (_event, id: string) => {
  const notas = (loadNotas() as { id: string }[]).filter((n) => n.id !== id);
  saveNotas(notas);
});

ipcMain.handle("print:toPDF", async (event, nomeArquivo: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false, error: "Janela não encontrada" };

  try {
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      margins: { marginType: "printableArea" },
    });

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Salvar NF-e como PDF",
      defaultPath: `${nomeArquivo}.pdf`,
      filters: [{ name: "Documento PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) return { success: false };

    writeFileSync(filePath, pdfData);
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "default",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
