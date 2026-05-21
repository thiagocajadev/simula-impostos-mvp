import { join } from "node:path";
import { app, type BrowserWindow, Menu, nativeImage, Tray } from "electron";

function createTray(mainWindow: BrowserWindow): Tray {
  const rawIcon = nativeImage.createFromPath(join(__dirname, "../../resources/icon.png"));
  const icon = rawIcon.resize({ width: 16, height: 16 });

  const tray = new Tray(icon);

  const menu = Menu.buildFromTemplate([
    {
      label: "Mostrar",
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: "separator" },
    { label: "Sair", click: () => app.quit() },
  ]);

  tray.setToolTip("Simula Impostos");
  tray.setContextMenu(menu);
  tray.on("double-click", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  return tray;
}

export { createTray };
