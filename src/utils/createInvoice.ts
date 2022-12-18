import {
    createCanvas,
    SKRSContext2D as Context2D,
    loadImage,
} from '@napi-rs/canvas';
import path from 'path';
import { app, dialog } from 'electron';
import fs from 'fs';

import { invoiceRow, invoiceInfo, Account, Client } from '../utils/types';

async function createPDF(pdfInfo: invoiceInfo) {
    let x: number, y: number;
    let maxRowSize = 27;
    let breakPoint = 14;
    let maxPageWithSummation = 18;

    const logoPath: string = path.join(app.getPath('userData'), 'logo.png');

    async function printPDF(pdfInfo: invoiceInfo): Promise<void> {
        const {
            invoiceRows: rows,
            account,
            client,
            dueDate,
            totalPrice,
            notes,
        } = pdfInfo;
        const { invoiceNumber, companyName } = client;

        console.log(pdfInfo);

        const canvas = createCanvas(595, 842);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 595, 842);

        await printHeader(ctx, account);
        await printAddress(ctx, client, dueDate);

        let rowY = 254;
        await printRowHeader(ctx, rowY - 20);

        let numPrintedRows = 0;

        let rowsLeft = rows.length;

        await printRowBoxes(
            ctx,
            rowY,
            rowsLeft < maxPageWithSummation ? maxPageWithSummation : maxRowSize
        );

        for (const row of rows) {
            numPrintedRows++;
            await printRow(ctx, rowY, row);
            rowY += 20;

            if (newPageRequired(numPrintedRows, rowsLeft)) {
                rowsLeft -= numPrintedRows;
                numPrintedRows = 0;

                maxRowSize = 32;
                maxPageWithSummation = 23;
                breakPoint = 20;

                rowY = 154;
                await newPage(
                    ctx,
                    account,
                    rowY,
                    rowsLeft < maxPageWithSummation
                        ? maxPageWithSummation
                        : maxRowSize
                );
            }
        }

        printNotes(ctx, notes);
        printSummary(ctx, totalPrice);

        const args = {
            buffer: canvas.toBuffer('image/png'),
            fileName: `INV-${String(invoiceNumber).padStart(5, '0')}-${getDate({
                splitter: '-',
            })}-${companyName}.png`,
        };

        const { buffer, fileName } = args;

        const options = {
            title: 'Save file',
            defaultPath: fileName,
            filters: [
                { name: 'Images', extensions: ['png'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        };

        dialog.showSaveDialog(options).then(({ canceled, filePath }) => {
            if (canceled) return;
            fs.writeFileSync(filePath, buffer);
        });
    }

    function reset(): void {
        x = 100;
        y = 52;
    }

    async function printHeader(
        ctx: Context2D,
        account: Account
    ): Promise<void> {
        reset();
        const {
            contactName,
            companyName,
            address,
            aBN,
            websiteURL,
            phoneNumber,
        } = account;
        const { streetNumber, streetName, cityName, zipCode, state, country } =
            address;

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
        ctx.font = font(16, 'bold');
        ctx.fillText(`${companyName}`, x, y);

        const logo = await loadImage(logoPath);
        ctx.drawImage(logo, x - 70, y - 12, 60, 60);

        y += 20;
        ctx.font = font(12);
        ctx.fillText(`${contactName}`, x, y);
        y += 14;
        ctx.fillText(`${streetNumber} ${streetName}`, x, y);
        ctx.fillText(`PH: ${phoneNumber}`, 380, y);
        y += 14;
        ctx.fillText(`${cityName}, ${zipCode}`, x, y);
        if (aBN) ctx.fillText(`ABN: ${aBN}`, 380, y);
        y += 14;
        ctx.fillText(`${state}, ${country}`, x, y);
        if (websiteURL) ctx.fillText(`WEB: ${websiteURL}`, 380, y);

        reset();
        ctx.font = font(24, 'bold');
        ctx.fillStyle = '#C8C8C8';
        ctx.fillText('INVOICE', 450, y);

        ctx.font = font(12);
        ctx.fillStyle = 'black';
    }

    async function printAddress(
        ctx: Context2D,
        client: Client,
        dueDate: string
    ): Promise<void> {
        reset();
        const { address, invoiceNumber, contactName } = client;
        const { streetNumber, streetName, cityName, zipCode, state, country } =
            address;

        ctx.strokeStyle = '#C8C8C8';
        ctx.fillStyle = 'black';
        ctx.lineWidth = 1.5;

        y = 132;
        x = 60;

        ctx.beginPath();
        ctx.lineTo(x, y);
        ctx.lineTo(595 - x, y);
        ctx.stroke();

        y += 25;
        x = 100;

        ctx.font = font(12, 'bold');
        ctx.fillText('Bill To:', x, y);
        y += 14;
        ctx.font = font(12);
        ctx.fillText(`${contactName}`, x, y);
        ctx.fillText('Invoice #: ', 380, y);
        ctx.fillText(`INV-${String(invoiceNumber).padStart(5, '0')}`, 465, y);
        y += 14;
        ctx.fillText(`${streetNumber} ${streetName}`, x, y);
        ctx.fillText('Invoice Date: ', 380, y);
        ctx.fillText(`${getDate()}`, 475, y);
        y += 14;
        ctx.fillText(`${cityName}, ${zipCode}`, x, y);
        ctx.fillText('Invoice Due: ', 380, y);
        ctx.fillText(`${getDate({ dateStamp: dueDate })}`, 475, y);
        y += 14;
        ctx.fillText(`${state}, ${country}`, x, y);
    }

    async function printRowHeader(ctx: Context2D, rowY: number): Promise<void> {
        reset();
        ctx.fillStyle = 'rgb(230, 230, 230)';
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        x = 50;

        ctx.fillRect(x, rowY, 495, 20);
        ctx.strokeRect(x, rowY, 495, 20);

        ctx.font = font(14);
        ctx.fillStyle = 'black';

        x += 5;
        rowY += 15;

        ctx.fillText('Product', x, rowY); // 49
        x += 95;
        ctx.fillText('Description', x, rowY); // 71

        x = 490;
        x -= 15;
        ctx.fillText('Amount', x, rowY); // 49
        x -= 50;
        ctx.fillText('Qty.', x, rowY); // 25
        x -= 60;
        ctx.fillText('Cost', x, rowY); // 29
    }

    async function printRowBoxes(
        ctx: Context2D,
        rowY: number,
        numOfRows: number
    ): Promise<void> {
        reset();
        ctx.fillStyle = 'rgb(230, 230, 230)';
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        x = 50;

        for (let index = 0; index < numOfRows; index++) {
            if (index % 2 === 1) ctx.fillRect(x, rowY, 495, 20);

            ctx.beginPath();
            ctx.lineTo(x, rowY);
            ctx.lineTo(x, rowY + 20);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineTo(x + 495, rowY);
            ctx.lineTo(x + 495, rowY + 20);
            ctx.stroke();

            rowY += 20;
        }

        ctx.beginPath();
        ctx.lineTo(x, rowY);
        ctx.lineTo(x + 495, rowY);
        ctx.stroke();
    }

    async function printRow(ctx: Context2D, rowY: number, row: invoiceRow) {
        reset();
        const { cost, description, product, quantity } = row;

        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.font = font(12);
        const textY: number = rowY + 14;
        x = 55;

        ctx.fillText(product, x, textY);
        x += 95;
        ctx.fillText(description, x, textY);
        x = 490;
        x -= 12;
        ctx.fillText(String(cost * quantity), x, textY);
        x -= 50;
        ctx.fillText(String(quantity), x, textY);
        x -= 60;
        ctx.fillText(String(cost), x, textY);
    }

    async function newPage(
        ctx: Context2D,
        account: Account,
        rowY: number,
        numOfRows: number
    ) {
        // ctx.addPage();
        await printHeader(ctx, account);
        await printRowHeader(ctx, rowY - 20);
        await printRowBoxes(ctx, rowY, numOfRows);
    }

    async function printSummary(ctx: Context2D, totalCost: number) {
        reset();
        const valueY = 13;
        const subTotal = (totalCost * 0.9).toFixed(2);
        const GST = (totalCost * 0.1).toFixed(2);

        function newBox(text: string, first = false) {
            if (!first) y += 30;
            x = 405;
            ctx.font = font(10, 'bold');
            ctx.strokeRect(x, y, 140, 16);
            ctx.fillText(text, x, y - 2);
        }

        function textRight(text: string) {
            ctx.font = font(12);
            x = 405;
            ctx.fillText(`$${text}`, x, y + valueY);
        }

        ctx.strokeStyle = 'rgb(100, 100, 100)';
        ctx.fillStyle = 'black';

        y = 644;

        newBox('Sub Total', true);
        textRight(subTotal);

        newBox('GST');
        textRight(GST);

        newBox('Total');
        textRight(totalCost.toFixed(2));
    }

    async function printNotes(ctx: Context2D, notes: string) {
        reset();
        ctx.strokeStyle = 'rgb(100, 100, 100)';
        ctx.fillStyle = 'black';
        notes = notes.replace(RegExp(/\s/gim), ' ');

        x = 50;
        y = 644;
        ctx.font = font(12, 'bold');
        ctx.fillText('Notes:', x + 2, y - 4);
        ctx.strokeRect(x, y, 335, 150);

        ctx.font = font(10);
        let notesLine = '';
        y += 12;
        x += 5;
        for (const str of notes.split(' ')) {
            if (ctx.measureText(notesLine + ' ' + str).width >= 330) {
                if (y > 782) {
                    notesLine.trim();
                    notesLine += '...';
                    ctx.fillText(notesLine, x, y);
                    notesLine = '';
                    break;
                }

                ctx.fillText(notesLine, x, y);
                y += 12;
                notesLine = '';
            }

            notesLine += str + ' ';
        }

        ctx.font = font(10);
        ctx.fillText(notesLine, x, y);
    }

    function font(size: number, weight = 'normal', name = 'Arial'): string {
        return `${weight} ${size}px ${name}`;
    }

    function getDate(args?: { dateStamp?: string; splitter?: string }): string {
        let date;
        if (args?.dateStamp) {
            date = new Date(args?.dateStamp);
        } else {
            date = new Date();
        }
        const ts = date.valueOf() - date.getTimezoneOffset() * 60000;
        date = new Date(ts);
        const formattedTime = formatTime(date, args?.splitter);
        return formattedTime;
    }

    function formatTime(date: Date, splitter = '/'): string {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return day + splitter + month + splitter + year;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function applyText(
        ctx: CanvasRenderingContext2D,
        text: string,
        areaWidth: number,
        fontSize: number
    ) {
        do {
            ctx.font = font(fontSize);
            fontSize -= 2;
        } while (ctx.measureText(text).width > areaWidth);

        return ctx.font;
    }

    function newPageRequired(numPrintedRows: number, rowsLeft: number) {
        if (numPrintedRows >= maxRowSize) return true;

        if (maxPageWithSummation < rowsLeft && rowsLeft < maxRowSize)
            if (numPrintedRows >= breakPoint) return true;

        return false;
    }

    printPDF(pdfInfo);
}

export { createPDF };
