import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Control, useWatch } from 'react-hook-form';
import { Client, pdfRow, pdfInfo, Account } from '../../utils/types';

function currencyFormat(amount: number) {
    return Intl.NumberFormat('en-AU', {
        currency: 'AUD',
        style: 'currency',
    }).format(amount);
}

const defaultRow: pdfRow = {
    product: '',
    description: '',
    quantity: 0,
    cost: 0,
};

function RowPrice({
    control,
    index,
}: {
    control: Control<pdfInfo>;
    index: number;
}) {
    const value = useWatch({
        control,
        name: `rows.${index}`,
        defaultValue: defaultRow,
    });

    const rowTotal: number = (value.quantity || 0) * (value.cost || 0);
    return (
        <span style={{ paddingLeft: '10px' }}>{currencyFormat(rowTotal)}</span>
    );
}

let totalPrice = 0;

function TotalPrice({ control }: { control: Control<pdfInfo> }) {
    const values = useWatch({
        control,
        name: `rows`,
        defaultValue: [defaultRow],
    });

    const total = values.reduce(
        (total, { quantity, cost }) => total + (quantity || 0) * (cost || 0),
        0
    );

    totalPrice = total;

    return (
        <span
            style={{
                padding: '10px 0px 0px 485px',
                display: 'block',
            }}
        >
            Total: {currencyFormat(total)}
        </span>
    );
}

export const Quotes = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<pdfInfo>({
        defaultValues: {
            rows: [{}],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'rows',
    });

    const onSubmit = handleSubmit(async (pdfInfo: pdfInfo) => {
        const client =
            clients[
                clients.findIndex(
                    ({ clientID }) =>
                        clientID === Number(pdfInfo.client.clientID)
                )
            ];

        pdfInfo.client = client;
        pdfInfo.account = account;
        pdfInfo.totalPrice = totalPrice;

        try {
            await api.pdf.createPDF(pdfInfo, 'Quote');
        } catch (err) {
            console.error(err);
        }
    });

    const [account, setAccount] = useState<Account>(api.sql.getAccount());
    const [clients, setClients] = useState<Client[]>(api.sql.getClients());

    useEffect(() => {
        setClients(api.sql.getClients());
        setAccount(api.sql.getAccount());
    }, []);

    return (
        <div className="page">
            <h2>Quotes</h2>
            <form onSubmit={onSubmit}>
                <select
                    {...register(`client.clientID`, {
                        required: 'Please Select a Client',
                    })}
                    className="button"
                >
                    <option value="">Select Client</option>
                    {clients &&
                        clients.map((client) => {
                            return (
                                <option
                                    value={client.clientID}
                                    key={client.clientID}
                                >
                                    {client.clientID} - {client.companyName}
                                </option>
                            );
                        })}
                </select>
                <p className="warning">{errors.client?.clientID?.message}</p>
                <div>
                    <span
                        style={{
                            paddingLeft: '22px',
                            paddingRight: '80px',
                        }}
                    >
                        Product
                    </span>
                    <span style={{ paddingRight: '178px' }}>Description</span>
                    <span style={{ paddingRight: '20px' }}>Qty.</span>
                    <span>Cost</span>
                </div>
                {fields.map(({ id }, index) => {
                    return (
                        <div key={id}>
                            <span
                                style={{
                                    paddingRight: '2px',
                                    textAlign: 'right',
                                }}
                            >
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <input
                                style={{ width: '125px', height: '18px' }}
                                {...register(`rows.${index}.product`)}
                            />
                            <input
                                style={{ width: '250px', height: '18px' }}
                                {...register(`rows.${index}.description`)}
                            />
                            <input
                                type="number"
                                step="0.1"
                                style={{ width: '40px', height: '18px' }}
                                {...register(`rows.${index}.quantity`, {
                                    valueAsNumber: true,
                                })}
                            />
                            <input
                                type="number"
                                step="0.01"
                                style={{ width: '60px', height: '18px' }}
                                {...register(`rows.${index}.cost`, {
                                    valueAsNumber: true,
                                })}
                            />
                            <button
                                style={{ width: '40px', height: '24px' }}
                                type="button"
                                onClick={() => remove(index)}
                            >
                                &#9940;
                            </button>
                            <RowPrice control={control} index={index} />
                        </div>
                    );
                })}
                <button
                    className="button"
                    type="button"
                    onClick={() => append(defaultRow)}
                >
                    Add Row
                </button>
                <TotalPrice control={control} />
                <br />
                <label>Valid Until Date: </label>
                <input
                    type="date"
                    {...register(`date`, {
                        required: 'Valid Until is required',
                    })}
                />
                <input
                    type="number"
                    placeholder="Quote Number"
                    {...register(`docNumber`, {
                        required: 'Quote number is required',
                    })}
                />
                <p className="warning">{errors.date?.message}</p>
                <p className="warning">{errors.docNumber?.message}</p>
                <textarea
                    {...register(`notes`)}
                    placeholder="Notes"
                    style={{
                        whiteSpace: 'pre-line',
                        width: '450px',
                        height: '100px',
                    }}
                />
                <br />
                <button className="button" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
};
