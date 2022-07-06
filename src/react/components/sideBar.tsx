import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ProSidebar,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
    MenuItem,
    Menu,
} from 'react-pro-sidebar';

import {
    FaList,
    FaHome,
    FaCog,
    FaFileContract,
    FaFileInvoiceDollar,
    FaQuoteRight,
} from 'react-icons/fa';

import 'react-pro-sidebar/dist/css/styles.css';
import './SideBar.css';

export const SideBar = () => {
    const iconSize = 25;
    const navigate = useNavigate();

    return (
        <div id="sidebar">
            <ProSidebar collapsed={false}>
                <SidebarHeader>
                    <div className="logotext">
                        <p>Invoice Maker</p>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <Menu iconShape="square">
                        <MenuItem
                            active={true}
                            icon={<FaHome size={iconSize} />}
                            onClick={() => navigate('/')}
                        >
                            Home
                        </MenuItem>
                        <MenuItem
                            icon={<FaList size={iconSize} />}
                            onClick={() => navigate('/clients')}
                        >
                            Clients
                        </MenuItem>
                        <MenuItem
                            icon={<FaFileInvoiceDollar size={iconSize} />}
                            onClick={() => navigate('/invoices')}
                        >
                            Invoices
                        </MenuItem>
                        <MenuItem
                            icon={<FaFileContract size={iconSize} />}
                            onClick={() => navigate('/contracts')}
                        >
                            Contracts
                        </MenuItem>
                        <MenuItem
                            icon={<FaQuoteRight size={iconSize - 6.5} />}
                            onClick={() => navigate('/quotes')}
                        >
                            Quotes
                        </MenuItem>
                    </Menu>
                </SidebarContent>
                <SidebarFooter>
                    <Menu iconShape="square">
                        <MenuItem
                            icon={<FaCog />}
                            onClick={() => navigate('/settings')}
                        >
                            Settings
                        </MenuItem>
                    </Menu>
                </SidebarFooter>
            </ProSidebar>
        </div>
    );
};
