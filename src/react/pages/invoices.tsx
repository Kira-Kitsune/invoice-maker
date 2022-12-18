import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Control, useWatch } from 'react-hook-form';
import { Client, invoiceRow, invoiceInfo, Account } from '../../utils/types';

const defaultRow: invoiceRow = {
    product: '',
    description: '',
    quantity: 0,
    cost: 0,
};

function RowPrice({
    control,
    index,
}: {
    control: Control<invoiceInfo>;
    index: number;
}) {
    const value = useWatch({
        control,
        name: `invoiceRows.${index}`,
        defaultValue: defaultRow,
    });

    const rowTotal: number = (value.quantity || 0) * (value.cost || 0);
    return <span style={{ paddingLeft: '10px' }}>${rowTotal}</span>;
}

let totalPrice = 0;

function TotalPrice({ control }: { control: Control<invoiceInfo> }) {
    const values = useWatch({
        control,
        name: `invoiceRows`,
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
            Total: ${total}
        </span>
    );
}

export const Invoices = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<invoiceInfo>({
        defaultValues: {
            invoiceRows: [{}],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'invoiceRows',
    });

    const onSubmit = handleSubmit(async (invoiceInfo: invoiceInfo) => {
        const client =
            clients[
                clients.findIndex(
                    ({ clientID }) =>
                        clientID === Number(invoiceInfo.client.clientID)
                )
            ];

        invoiceInfo.client = client;
        invoiceInfo.account = account;
        invoiceInfo.totalPrice = totalPrice;

        try {
            await api.pdf.createPDF(invoiceInfo);
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
            <h2>Invoices</h2>
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
                    <span style={{ paddingLeft: '2px', paddingRight: '80px' }}>
                        Product
                    </span>
                    <span style={{ paddingRight: '178px' }}>Description</span>
                    <span style={{ paddingRight: '20px' }}>Qty.</span>
                    <span>Cost</span>
                </div>
                {fields.map(({ id }, index) => {
                    return (
                        <div key={id}>
                            <input
                                style={{ width: '125px', height: '18px' }}
                                {...register(`invoiceRows.${index}.product`)}
                            />
                            <input
                                style={{ width: '250px', height: '18px' }}
                                {...register(
                                    `invoiceRows.${index}.description`
                                )}
                            />
                            <input
                                style={{ width: '40px', height: '18px' }}
                                {...register(`invoiceRows.${index}.quantity`, {
                                    valueAsNumber: true,
                                })}
                            />
                            <input
                                style={{ width: '60px', height: '18px' }}
                                {...register(`invoiceRows.${index}.cost`)}
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
                    onClick={() => append({})}
                    disabled={fields.length === 17}
                >
                    Add Row
                </button>
                <p className="warning">
                    Limited to 17 rows, due to current limitations
                </p>
                <label>Due Date: </label>
                <input
                    type="date"
                    {...register(`dueDate`, {
                        required: 'Due Date is required',
                    })}
                />
                <p className="warning">{errors.dueDate?.message}</p>
                <br />
                <textarea {...register(`notes`)} placeholder="Notes" />
                <TotalPrice control={control} />
                <button className="button" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
};
