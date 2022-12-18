import { ipcRenderer } from 'electron';
import { Account, Client, invoiceInfo } from '../utils/types';

export default {
    window: {
        close: () => ipcRenderer.send('app/close'),
        minimise: () => ipcRenderer.send('app/minimize'),
        maximise: () => ipcRenderer.send('app/maximize'),
    },
    sql: {
        getAccount: () => ipcRenderer.sendSync('sql/getAccount'),
        getClients: () => ipcRenderer.sendSync('sql/getClients'),
        sumProfits: () => ipcRenderer.sendSync('sql/sumProfits'),
        insertNewAccount: (newAccount: Account) =>
            ipcRenderer.send('sql/insertNewAccount', newAccount),
        insertNewClient: (newClient: Client) =>
            ipcRenderer.send('sql/insertNewClient', newClient),
    },
    other: {
        logo: () => ipcRenderer.send('app/storeLogo'),
    },
    pdf: {
        createPDF: (invoiceInfo: invoiceInfo) =>
            ipcRenderer.send('app/createPDF', invoiceInfo),
    },
};
