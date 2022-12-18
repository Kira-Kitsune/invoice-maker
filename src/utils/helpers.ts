import { app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

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
