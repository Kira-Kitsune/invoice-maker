import React, { useEffect, useState } from 'react';
import { Client } from '../../utils/types';

export const ViewClients = () => {
    const [clients, setClients] = useState<Client[]>(api.sql.getClients());

    useEffect(() => {
        setClients(api.sql.getClients());
    }, []);

    return (
        <div className="page">
            <h2>Viewing Clients</h2>
            {clients &&
                clients.map((client) => (
                    <div key={client.clientID}>
                        <span>
                            Client ID: {client.clientID} Company Name:{' '}
                            {client.companyName}
                        </span>
                        <br />
                    </div>
                ))}
        </div>
    );
};
