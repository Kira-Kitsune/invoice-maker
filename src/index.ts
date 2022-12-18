import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { storeLogo } from './utils/helpers';
import { createPDF } from './utils/createInvoice';
import sqlite from 'better-sqlite3';

import {
    getAccount,
    getClients,
    insertNewAccount,
    insertNewClient,
    sumProfits,
} from './models/queryMGR';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const USER_DATA_PATH: string = app.getPath('userData');
const DB_PATH = path.join(USER_DATA_PATH, 'database.sqlite3');
const db: sqlite.Database = new sqlite(DB_PATH);

if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow;

fileSetup();

const createWindow = () => {
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

ipcMain.on('app/createPDF', (_, args) => createPDF(args));

ipcMain.on('sql/getAccount', (event) => {
    event.returnValue = getAccount(db);
});
ipcMain.on('sql/getClients', (event) => {
    event.returnValue = getClients(db);
});
ipcMain.on('sql/sumProfits', (event) => {
    event.returnValue = sumProfits(db);
});
ipcMain.on('sql/insertNewAccount', (_, args) => insertNewAccount(db, args));
ipcMain.on('sql/insertNewClient', (_, args) => insertNewClient(db, args));

function fileSetup(): void {
    try {
        fs.readFileSync(DB_PATH);
    } catch (error) {
        return;
    }
}
