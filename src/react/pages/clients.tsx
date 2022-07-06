import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Clients = () => {
    const navigate = useNavigate();

    return (
        <div className="page">
            <h2>Clients Menu</h2>
            <button onClick={() => navigate('/new-client')}>
                Create New Client
            </button>
            <button onClick={() => navigate('/view-clients')}>
                View Clients
            </button>
        </div>
    );
};
