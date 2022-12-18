import sqlite from 'better-sqlite3';
import { AccountDB, ClientDB, Account, Address, Client } from '../utils/types';

const createAccounts = (db: sqlite.Database): sqlite.RunResult => {
    const createAccountsStmt = `CREATE TABLE IF NOT EXISTS accounts (
            CompanyName TEXT NOT NULL,
            ContactName TEXT NOT NULL,
            ContactEmail TEXT NOT NULL,
            Address TEXT NOT NULL,
            PhoneNumber TEXT NOT NULL,
            WebsiteURL TEXT DEFAULT null,
            ABN TEXT DEFAULT null,
            PRIMARY KEY (CompanyName)
        );`;
    const stmt = db.prepare(createAccountsStmt);
    const res = stmt.run();
    return res;
};

const createClients = (db: sqlite.Database): sqlite.RunResult => {
    const createClientsStmt = `CREATE TABLE IF NOT EXISTS clients (
            ClientID INTEGER,
            CompanyName TEXT NOT NULL,
            ContactName TEXT NOT NULL,
            ContactEmail TEXT NOT NULL,
            Address TEXT NOT NULL,
            PhoneNumber TEXT NOT NULL,
            WebsiteURL TEXT DEFAULT null,
            ABN TEXT DEFAULT null,
            Profits MONEY DEFAULT 0,
            InvoiceNumber INTEGER DEFAULT 1,
            PRIMARY KEY (ClientID)
        );`;
    const stmt = db.prepare(createClientsStmt);
    const res = stmt.run();
    return res;
};

const getClients = (db: sqlite.Database): Client[] => {
    const check = checkClientsExist(db);

    if (!check) return null;

    const getClientsStmt = `SELECT * FROM clients;`;
    const stmt = db.prepare<ClientDB[]>(getClientsStmt);
    const results: ClientDB[] = stmt.all();

    if (results.length === 0) return null;

    const clients: Client[] = results.map((client) => {
        return {
            clientID: client.ClientID,
            companyName: client.CompanyName,
            contactName: client.ContactName,
            contactEmail: client.ContactEmail,
            address: JSON.parse(client.Address),
            phoneNumber: client.PhoneNumber,
            websiteURL: client.WebsiteURL,
            aBN: client.ABN,
            profits: client.Profits,
            invoiceNumber: client.InvoiceNumber,
        };
    });

    return clients;
};

const getAccount = (db: sqlite.Database): Account => {
    const check = checkAccountsExist(db);
    if (!check) return null;

    const getAccountStmt = `SELECT * FROM accounts;`;
    const stmt = db.prepare<AccountDB[]>(getAccountStmt);
    const results: AccountDB[] = stmt.all();

    if (results.length === 0) return null;

    const result: AccountDB = results[0];
    const {
        CompanyName,
        ContactName,
        ContactEmail,
        Address,
        PhoneNumber,
        WebsiteURL,
        ABN,
    } = result;

    const addressObj: Address = JSON.parse(Address);

    return {
        companyName: CompanyName,
        contactName: ContactName,
        contactEmail: ContactEmail,
        address: addressObj,
        phoneNumber: PhoneNumber,
        websiteURL: WebsiteURL,
        aBN: ABN,
    };
};

const insertNewAccount = (db: sqlite.Database, account: Account): void => {
    checkAccountsExist(db);
    const {
        companyName,
        contactName,
        contactEmail,
        address,
        phoneNumber,
        websiteURL,
        aBN,
    } = account;
    const newAccount = `INSERT INTO accounts (CompanyName, ContactName, ContactEmail, Address, PhoneNumber, WebsiteURL, ABN)
    VALUES (?, ?, ?, ?, ?, ?, ?);`;
    const stmt = db.prepare(newAccount);

    const addressString = JSON.stringify(address);

    stmt.run(
        companyName,
        contactName,
        contactEmail,
        addressString,
        phoneNumber,
        websiteURL || null,
        aBN || null
    );
};

const insertNewClient = (db: sqlite.Database, client: Client): void => {
    checkClientsExist(db);
    const {
        companyName,
        contactName,
        contactEmail,
        address,
        phoneNumber,
        websiteURL,
        aBN,
        profits,
    } = client;
    const newClient = `INSERT INTO clients (CompanyName, ContactName, ContactEmail, Address, PhoneNumber, WebsiteURL, ABN, Profits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const stmt = db.prepare(newClient);

    const addressString = JSON.stringify(address);

    stmt.run(
        companyName,
        contactName,
        contactEmail,
        addressString,
        phoneNumber,
        websiteURL || null,
        aBN || null,
        profits
    );
};

const sumProfits = (db: sqlite.Database) => {
    checkClientsExist(db);
    const getSumProfits = `SELECT SUM(Profits) FROM clients;`;
    const stmt = db.prepare(getSumProfits);
    const results = stmt.all();
    console.log(results[0]['SUM(Profits)']);
    return results[0]['SUM(Profits)'];
};

const increaseInvoiceNumber = (db: sqlite.Database) => {
    checkClientsExist(db);
    const getSumProfits = `SELECT SUM(Profits) FROM clients;`;
    const stmt = db.prepare(getSumProfits);
    const results = stmt.all();
    console.log(results[0]['SUM(Profits)']);
    return results[0]['SUM(Profits)'];
};

function checkAccountsExist(db: sqlite.Database): boolean {
    const getAccountsStmt = `SELECT * FROM sqlite_master WHERE type='table' AND name='accounts';`;
    const stmt = db.prepare(getAccountsStmt);
    const check = stmt.all();

    if (check.length === 0) {
        createAccounts(db);
        return false;
    }
    return true;
}

function checkClientsExist(db: sqlite.Database): boolean {
    const getClientsStmt = `SELECT * FROM sqlite_master WHERE type='table' AND name='clients';`;
    const stmt = db.prepare(getClientsStmt);
    const check = stmt.all();

    if (check.length === 0) {
        createClients(db);
        return false;
    }
    return true;
}

export {
    getAccount,
    getClients,
    insertNewAccount,
    insertNewClient,
    sumProfits,
    increaseInvoiceNumber,
};
