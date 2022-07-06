import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Client } from '../../utils/types';

type FormData = Client;

export const NewClient = () => {
    const [, setClients] = useState<Client[]>(api.sql.getClients());
    const navigate = useNavigate();

    useEffect(() => {
        setClients(api.sql.getClients());
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = handleSubmit((newClient: FormData) => {
        api.sql.insertNewClient(newClient);
        navigate('/clients');
    });

    return (
        <div className="page">
            <form className="Form" onSubmit={onSubmit}>
                <h2>Create a new Client</h2>
                <input
                    {...register('companyName', {
                        required: `Company's Name is Required`,
                    })}
                    placeholder={"Company's Name"}
                />
                <p>{errors.companyName?.message}</p>
                <input
                    {...register('contactName', {
                        required: `Contact's Name is Required`,
                    })}
                    placeholder={"Contact's Full Name"}
                />
                <p>{errors.contactName?.message}</p>
                <input
                    {...register('contactEmail', {
                        required: `Contact's Email is Required`,
                    })}
                    placeholder={"Contact's Email"}
                />
                <p>{errors.contactEmail?.message}</p>
                <input
                    {...register('address.streetNumber', {
                        required: `Street Number is Required`,
                    })}
                    placeholder={'Street Number'}
                />
                <p>{errors.address?.streetNumber?.message}</p>
                <input
                    {...register('address.streetName', {
                        required: `Street Name is Required`,
                    })}
                    placeholder={'Street Name'}
                />
                <p>{errors.address?.streetName?.message}</p>
                <input
                    {...register('address.cityName', {
                        required: `City is Required`,
                    })}
                    placeholder={'City'}
                />
                <p>{errors.address?.cityName?.message}</p>
                <input
                    {...register('address.zipCode', {
                        required: `Zip/Postal Code is Required`,
                    })}
                    placeholder={'Zip/Postal Code'}
                />
                <p>{errors.address?.zipCode?.message}</p>
                <input
                    {...register('address.state', {
                        required: `State is Required`,
                    })}
                    placeholder={'State'}
                />
                <p>{errors.address?.state?.message}</p>
                <input
                    {...register('address.country', {
                        required: `Country is Required`,
                    })}
                    placeholder={'Country'}
                />
                <p>{errors.address?.country?.message}</p>
                <input
                    {...register('phoneNumber', {
                        required: `Contact's Phone Number is Required`,
                    })}
                    placeholder={"Contact's Phone Number"}
                />
                <p>{errors.phoneNumber?.message}</p>
                <input
                    {...register('websiteURL')}
                    placeholder={"Company's Website URL"}
                />
                <input {...register('aBN')} placeholder={"Contact's ABN/TFN"} />
                <input
                    {...register('profits', {
                        required: `Profits is Required`,
                    })}
                    placeholder={'Initial Profits'}
                />
                <p>{errors.profits?.message}</p>
                <button type="submit">Create New Client</button>
            </form>
        </div>
    );
};
