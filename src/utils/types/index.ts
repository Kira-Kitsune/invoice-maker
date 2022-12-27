export interface Account {
    companyName: string;
    contactName: string;
    contactEmail: string;
    address: Address;
    phoneNumber: string;
    websiteURL?: string | null;
    aBN?: string | null;
}

export interface Address {
    streetNumber: string;
    streetName: string;
    cityName: string;
    zipCode: string;
    state: string;
    country: string;
}

export interface AccountDB {
    CompanyName: string;
    ContactName: string;
    ContactEmail: string;
    Address: string;
    PhoneNumber: string;
    WebsiteURL?: string | null;
    ABN?: string | null;
}

export interface ClientDB {
    ClientID: number;
    CompanyName: string;
    ContactName: string;
    ContactEmail: string;
    Address: string;
    PhoneNumber: string;
    WebsiteURL?: string | null;
    ABN?: string | null;
    Profits: string | number;
    InvoiceNumber: string | number;
}

export interface Client {
    clientID: number;
    companyName: string;
    contactName: string;
    contactEmail: string;
    address: Address;
    phoneNumber: string;
    websiteURL?: string | null;
    aBN?: string | null;
    profits: string | number;
    invoiceNumber: string | number;
}

export interface pdfRow {
    product: string;
    description: string;
    quantity: number;
    cost: number;
}

export interface pdfInfo {
    account: Account;
    client: Client;
    rows: pdfRow[];
    docNumber: number;
    date: string;
    notes: string;
    totalPrice: number;
}
