import { app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

export function dbPath(): string {
    let appDataPath: string;
    switch (process.platform) {
        case 'darwin':
            appDataPath = process.env.HOME;
            break;
        case 'win32':
            appDataPath = process.env.APPDATA;
            break;
        case 'linux':
            appDataPath = process.env.HOME;
            break;
    }
    return path.join(appDataPath, 'invoice-maker', 'database.sqlite3');
}

export function storeLogo() {
    dialog
        .showOpenDialog({
            properties: ['openFile'],
            title: 'Select a Logo',
            filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
        })
        .then((result) => {
            if (result.canceled) {
                console.log('No file selected!');
            } else {
                const filePath = result.filePaths[0];
                const fileName = path.basename(filePath);

                const imgFolderPath = path.join(
                    app.getPath('userData'),
                    'logo.png'
                );

                fs.copyFile(filePath, imgFolderPath, (err) => {
                    if (err) throw err;
                    console.log(fileName + ' uploaded.');
                });
            }
        });
}
