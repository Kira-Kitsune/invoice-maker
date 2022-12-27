import path from 'path';
import { app, dialog } from 'electron';
import fs from 'fs';
import PDFDocument from 'pdfkit';

import { pdfRow, pdfInfo, Account, Client } from './types';
type PDFDoc = typeof PDFDocument;

async function createPDF(pdfInfo: pdfInfo, type: 'Invoice' | 'Quote') {
    let x: number, y: number;
    let textY: number;
    let maxRowSize = 27;
    let maxPageWithSummation = 18;

    const logoPath: string = path.join(app.getPath('userData'), 'logo.png');
    const prefix = type === 'Invoice' ? 'INV' : 'QTE';

    async function printPDF(pdfInfo: pdfInfo): Promise<void> {
        const { rows, account, client, date, totalPrice, notes, docNumber } =
            pdfInfo;
        const { companyName } = client;

        const fileName = `${prefix}-${String(docNumber).padStart(
            5,
            '0'
        )}-${getDate({
            splitter: '-',
        })}-${companyName}.pdf`;

        const options = {
            title: 'Save file',
            defaultPath: fileName,
            filters: [
                { name: 'PDF', extensions: ['pdf'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        };

        dialog.showSaveDialog(options).then(async ({ canceled, filePath }) => {
            if (canceled) return;
            const pdf = new PDFDocument({
                size: 'A4',
                compress: false,
                font: 'Helvetica',
                margins: { top: 0, left: 0, right: 0, bottom: 0 },
            });
            pdf.pipe(fs.createWriteStream(filePath));

            await printHeader(pdf, account);
            await printAddress(pdf, client, date, docNumber);

            let rowY = 254;
            await printRowHeader(pdf, rowY - 20);

            let printedRows = 0;

            let rowsLeft = rows.length;
            let rowsPrint = rowsToPrint(rowsLeft);

            await printRowBoxes(pdf, rowY, rowsPrint);

            // First Page
            // rowsToPrint = maxSum => 18 rows (w. sum)
            // rowsToPrint = maxRow => 27 rows (w/o sum)

            // Other Page
            // rowsToPrint = maxSum => 23 rows (w. sum)
            // rowsToPrint = maxRow => 32 rows (w/o sum)

            for (const row of rows) {
                printedRows++;
                rowsLeft--;
                await printRow(pdf, rowY, row);
                rowY += 20;

                if (requireNewPage(printedRows, rowsLeft, rowsPrint)) {
                    printedRows = 0;
                    printedRows = 0;

                    maxRowSize = 32;
                    maxPageWithSummation = 23;

                    rowY = 154;
                    rowsPrint = rowsToPrint(rowsLeft);
                    await newPage(pdf, account, rowY, rowsPrint);
                }
            }

            await printNotes(pdf, notes);
            await printSummary(pdf, totalPrice);
            pdf.end();
        });
    }

    function reset(): void {
        x = 100;
        y = 52;
        textY = y;
    }

    function requireNewPage(
        printedRows: number,
        rowsLeft: number,
        rowsPrint: number
    ) {
        const withSummation = rowsPrint === maxPageWithSummation;
        if (withSummation) return false;

        if (printedRows > maxRowSize) return true;
        if (!withSummation && rowsLeft === 0) return true;
        if (!withSummation && rowsLeft >= 0 && printedRows < maxRowSize)
            return false;

        return true;
    }

    function rowsToPrint(rowsLeft: number) {
        return rowsLeft <= maxPageWithSummation
            ? maxPageWithSummation
            : maxRowSize;
    }

    async function newPage(
        pdf: PDFDoc,
        account: Account,
        rowY: number,
        numOfRows: number
    ) {
        pdf.addPage();
        await printHeader(pdf, account);
        await printRowHeader(pdf, rowY - 20);
        await printRowBoxes(pdf, rowY, numOfRows);
    }

    async function printHeader(pdf: PDFDoc, account: Account): Promise<void> {
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

        pdf.strokeColor('black');
        pdf.fillColor('black');
        font(pdf, 16, 'Helvetica-Bold');
        textY = y - 16;
        pdf.text(`${companyName}`, x, textY);

        pdf.image(logoPath, x - 70, y - 12, {
            fit: [60, 60],
        });

        y += 20;
        font(pdf, 12);
        textY = y - 12;
        pdf.text(`${contactName}`, x, textY);
        textY += 14;
        pdf.text(`${streetNumber} ${streetName}`, x, textY);
        pdf.text(`PH: ${phoneNumber}`, 380, textY);
        textY += 14;
        pdf.text(`${cityName}, ${zipCode}`, x, textY);
        if (aBN && aBN !== 'null') pdf.text(`ABN: ${aBN}`, 380, y);
        textY += 14;
        pdf.text(`${state}, ${country}`, x, textY);
        if (websiteURL && websiteURL !== 'null') {
            if (!aBN || aBN || aBN === 'null') textY -= 14;
            pdf.text(`WEB: ${websiteURL}`, 380, textY);
        }

        reset();
        font(pdf, 24, 'Helvetica-Bold');
        textY -= 24;
        pdf.fillColor('#C8C8C8');
        pdf.text(`${type.toUpperCase()}`, 450, textY);

        font(pdf, 12);
        pdf.fillColor('black');
    }

    async function printAddress(
        pdf: PDFDoc,
        client: Client,
        date: string,
        docNumber: number
    ): Promise<void> {
        reset();
        const { address, contactName } = client;
        const { streetNumber, streetName, cityName, zipCode, state, country } =
            address;

        pdf.strokeColor('#C8C8C8');
        pdf.fillColor('black');
        pdf.lineWidth(1.5);

        y = 132;
        x = 60;

        pdf.save();

        pdf.moveTo(x, y)
            .lineTo(595 - x, y)
            .stroke();

        y += 25;
        x = 100;

        textY = y - 12;
        font(pdf, 12, 'Helvetica-Bold');
        pdf.text(`${type} To:`, x, textY);
        textY += 14;
        font(pdf, 12);
        pdf.text(`${contactName}`, x, textY);
        pdf.text(`${type} #: `, 380, textY);
        pdf.text(`${prefix}-${String(docNumber).padStart(5, '0')}`, 465, textY);
        textY += 14;
        pdf.text(`${streetNumber} ${streetName}`, x, textY);
        pdf.text(`${type} Date: `, 380, textY);
        pdf.text(`${getDate()}`, 465, textY);
        textY += 14;

        pdf.text(`${cityName}, ${zipCode}`, x, textY);
        pdf.text(
            `${type === 'Quote' ? 'Valid Until: ' : `${type} Due: `}: `,
            380,
            textY
        );
        pdf.text(`${getDate({ dateStamp: date })}`, 465, textY);

        textY += 14;
        pdf.text(`${state}, ${country}`, x, textY);
    }

    async function printRowHeader(pdf: PDFDoc, rowY: number): Promise<void> {
        reset();
        pdf.fillColor('#E6E6E6');
        pdf.strokeColor('#646464');

        x = 50;

        pdf.rect(x, rowY, 495, 20).fill();
        pdf.rect(x, rowY, 495, 20).stroke();

        font(pdf, 14);
        pdf.fillColor('black');

        x += 5;
        textY = rowY + 4;

        pdf.text('Product - Description', x, textY); // 49

        x = 490;
        x -= 15;
        pdf.text('Amount', x, textY); // 49
        x -= 50;
        pdf.text('Qty.', x, textY); // 25
        x -= 60;
        pdf.text('Cost', x, textY); // 29
    }

    async function printRowBoxes(
        pdf: PDFDoc,
        rowY: number,
        numOfRows: number
    ): Promise<void> {
        reset();
        pdf.fillColor('#E6E6E6');
        pdf.strokeColor('#646464');

        x = 50;

        for (let index = 0; index < numOfRows; index++) {
            if (index % 2 === 1) pdf.rect(x, rowY, 495, 20).fill();

            pdf.moveTo(x, rowY)
                .lineTo(x, rowY + 20)
                .stroke();

            pdf.moveTo(x + 495, rowY)
                .lineTo(x + 495, rowY + 20)
                .stroke();

            rowY += 20;
        }

        pdf.moveTo(x, rowY)
            .lineTo(x + 495, rowY)
            .stroke();
    }

    async function printRow(pdf: PDFDoc, rowY: number, row: pdfRow) {
        reset();
        const { cost, description, product, quantity } = row;

        pdf.fillColor('#646464');
        font(pdf, 12);
        textY = rowY + 4;
        x = 55;

        pdf.text(`${product} - ${description}`, x, textY);
        x = 490;
        x -= 12;
        pdf.text(currencyFormat(cost * quantity, false), x, textY);
        x -= 50;
        pdf.text(String(quantity), x, textY);
        x -= 60;
        pdf.text(String(cost), x, textY);
    }

    async function printSummary(pdf: PDFDoc, totalCost: number) {
        reset();
        const valueY = 13;
        const subTotal = totalCost * 0.9;
        const GST = totalCost * 0.1;

        function newBox(text: string, first = false) {
            if (!first) y += 30;
            x = 405;
            textY = y - 10;
            font(pdf, 10, 'Helvetica-Bold');
            pdf.rect(x, y, 140, 16).stroke();
            pdf.text(text, x, textY, {
                align: 'right',
                width: 140,
            });
        }

        function moneyInBox(amount: number) {
            font(pdf, 12);
            x = 406;
            textY = y - 10;
            pdf.text(`${currencyFormat(amount)}`, x, textY + valueY, {
                align: 'right',
                width: 136,
            });
        }

        pdf.strokeColor('#646464');
        pdf.fillColor('black');

        y = 644;

        newBox('Sub Total', true);
        moneyInBox(subTotal);

        newBox('GST');
        moneyInBox(GST);

        newBox('Total');
        moneyInBox(totalCost);
    }

    async function printNotes(pdf: PDFDoc, notes: string) {
        reset();
        pdf.strokeColor('#646464');
        pdf.fillColor('black');
        notes = notes.replaceAll('\n', ' \n ');

        x = 50;
        y = 644;
        textY = y - 12;
        font(pdf, 12, 'Helvetica-Bold');
        pdf.text('Notes:', x + 2, textY - 4);
        pdf.rect(x, y, 336, 160).stroke();

        font(pdf, 10);
        x += 3;
        textY += 16;

        pdf.text(notes, x, textY, {
            width: 330,
            height: 156,
            ellipsis: true,
        });
    }

    function font(
        pdf: PDFDoc,
        size: number,
        font: 'Helvetica' | 'Helvetica-Bold' = 'Helvetica'
    ) {
        pdf.fontSize(size).font(font);
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

    function currencyFormat(amount: number, symbol = true) {
        const opts = symbol
            ? {
                  currency: 'AUD',
                  style: 'currency',
              }
            : { maximumFractionDigits: 2 };
        return Intl.NumberFormat('en-AU', opts).format(amount);
    }

    printPDF(pdfInfo);
}

export { createPDF };
