import { ipcRenderer } from 'electron';
import { Account, Client, invoiceInfo } from '../utils/types';
import {
    getAccount,
    getClients,
    insertNewAccount,
    insertNewClient,
    sumProfits,
} from '../models/queryMGR';

export default {
    window: {
        close: () => ipcRenderer.send('app/close'),
        minimise: () => ipcRenderer.send('app/minimize'),
        maximise: () => ipcRenderer.send('app/maximize'),
    },
    sql: {
        getAccount: () => getAccount(),
        getClients: () => getClients(),
        sumProfits: () => sumProfits(),
        insertNewAccount: (newAccount: Account) => insertNewAccount(newAccount),
        insertNewClient: (newClient: Client) => insertNewClient(newClient),
    },
    other: {
        logo: () => ipcRenderer.send('app/storeLogo'),
    },
    pdf: {
        createPDF: (invoiceInfo: invoiceInfo) =>
            ipcRenderer.send('app/createPDF', invoiceInfo),
    },
};
