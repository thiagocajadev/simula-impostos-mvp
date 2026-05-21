import { writeFile } from "node:fs/promises";
import { BrowserWindow, dialog, ipcMain } from "electron";

function registerPrintHandlers(): void {
  ipcMain.handle("print:toPDF", async (event, fileName: string) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (!browserWindow) {
      const result = { success: false, error: "Janela não encontrada" };
      return result;
    }

    try {
      const pdfData = await browserWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: "A4",
        margins: { marginType: "printableArea" },
      });

      const { canceled, filePath } = await dialog.showSaveDialog(browserWindow, {
        title: "Salvar NF-e como PDF",
        defaultPath: `${fileName}.pdf`,
        filters: [{ name: "Documento PDF", extensions: ["pdf"] }],
      });

      if (canceled || !filePath) {
        const result = { success: false };
        return result;
      }

      await writeFile(filePath, pdfData);
      const result = { success: true, filePath };
      return result;
    } catch (error) {
      const result = { success: false, error: String(error) };
      return result;
    }
  });
}

export { registerPrintHandlers };
