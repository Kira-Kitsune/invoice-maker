import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { storeLogo } from './utils/helpers';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const userDataPath: string = app.getPath('userData');

const dbPath = path.join(userDataPath, 'database.sqlite3');

if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = (): void => {
    fileSetup();
    mainWindow = new BrowserWindow({
        minHeight: 500,
        height: 600,
        minWidth: 940,
        width: 800,
        frame: false,
        show: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    mainWindow.on('ready-to-show', () => mainWindow.show());
};

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('app/close', () => app.quit());
ipcMain.on('app/minimize', () => mainWindow.minimize());
ipcMain.on('app/maximize', () => {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
});

ipcMain.on('app/storeLogo', () => storeLogo());

function fileSetup(): void {
    try {
        fs.readFileSync(dbPath);
    } catch (error) {
        return;
    }
}
