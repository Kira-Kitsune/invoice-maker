declare const api: {
    window: {
        close: () => void;
        minimise: () => void;
        maximise: () => void;
    };
    sql: {
        getAccount: () => Account;
        getClients: () => Client[];
        sumProfits: () => number;
        insertNewAccount: (newAccount: Account) => void;
        insertNewClient: (newClient: Client) => void;
    };
    other: {
        logo: () => void;
    };
    pdf: {
        createPDF: (invoiceInfo: invoiceInfo) => Promise<void>;
    };
};
