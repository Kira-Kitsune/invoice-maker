import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SideBar, TopBar } from './components';
import {
    Home,
    Clients,
    Invoices,
    Contracts,
    Quotes,
    Settings,
    NewAccount,
    NewClient,
} from './pages';
import { ViewClients } from './pages/viewClients';

export default function App() {
    return (
        <>
            <TopBar />
            <SideBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/new-account" element={<NewAccount />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/new-client" element={<NewClient />} />
                <Route path="/view-clients" element={<ViewClients />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </>
    );
}
