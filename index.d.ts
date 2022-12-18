declare const api: {
    window: {
        close: () => void;
        minimise: () => void;
        maximise: () => void;
    };
    sql: {
        getAccount: () => Account;
        getClients: () => Clients;
        sumProfits: () => number;
        insertNewAccount: (newAccount: Account) => void;
        insertNewClient: (newClient: Client) => void;
    };
    other: {
        logo: () => void;
        getDBPath: () => string;
    };
    pdf: {
        createPDF: (invoiceInfo: invoiceInfo) => Promise<void>;
    };
};
