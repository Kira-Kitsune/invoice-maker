import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Account } from '../../utils/types';

export const Home = () => {
    const [account, setAccount] = useState<Account>(api.sql.getAccount());
    const [sumProfits, setSumProfits] = useState<number>(
        api.sql.sumProfits() || 0
    );
    const navigate = useNavigate();

    useEffect(() => {
        setAccount(api.sql.getAccount());
        setSumProfits(api.sql.sumProfits());
        needNewAccount();
    }, []);

    const needNewAccount = () => {
        if (!account) {
            navigate('/new-account');
        }
    };

    return (
        <div className="page">
            <h2>Welcome Back{account && ', ' + account.contactName}!</h2>
            <h3>
                You have earnt a total of ${sumProfits ? sumProfits : '0'} in
                profits from all clients
            </h3>
        </div>
    );
};
