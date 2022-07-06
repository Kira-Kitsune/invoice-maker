import {
    createCanvas,
    CanvasRenderingContext2D as Context2D,
    loadImage,
} from 'canvas';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let x: number, y: number;
let maxRowSize = 27;
let breakPoint = 14;
let maxPageWithSummation = 18;

const logoPath: string = path.join(
    'C:\\Users\\Kira\\AppData\\Roaming\\invoice-maker',
    'logo.png'
);

async function createPDF(): Promise<void> {
    const canvas = createCanvas(595, 842, 'pdf');
    const ctx = canvas.getContext('2d');
    await printHeader(ctx);
    await printAddress(ctx);

    let rowY = 254;
    await printRowHeader(ctx, rowY - 20);

    let numPrintedRows = 0;

    const rows = [
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
        '2',
        '23',
        '3',
        '3',
        '6',
        '35',
    ];

    let rowsLeft = rows.length;

    await printRowBoxes(
        ctx,
        rowY,
        rowsLeft < maxPageWithSummation ? maxPageWithSummation : maxRowSize
    );

    for (const row of rows) {
        numPrintedRows++;
        printRow(row);
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
                rowY,
                rowsLeft < maxPageWithSummation
                    ? maxPageWithSummation
                    : maxRowSize
            );
        }
    }

    printNotes(ctx);
    printSummary(ctx, 30_000);

    fs.writeFile('out.pdf', canvas.toBuffer(), function (err) {
        if (err) throw err;
        console.log('created out.pdf');
    });
}

function reset(): void {
    x = 100;
    y = 52;
}

async function printHeader(ctx: Context2D): Promise<void> {
    reset();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.font = font(16, 'bold');
    ctx.fillText('DeSynkro', x, y);

    const logo = await loadImage(logoPath);
    ctx.drawImage(logo, x - 70, y - 12, 60, 60);

    y += 20;
    ctx.font = font(12);
    ctx.fillText('Iago Rosa', x, y);
    y += 14;
    ctx.fillText('16 Sittella Gardens', x, y);
    ctx.fillText('ABN: 18 515 876 437', 380, y);
    y += 14;
    ctx.fillText('East Cannington, 6107', x, y);
    ctx.fillText('WEB: www.desynkro.com', 380, y);
    y += 14;
    ctx.fillText('Western Australia, Australia', x, y);
    ctx.fillText('PH: 0427 334 393', 380, y);

    reset();
    ctx.font = font(24, 'bold');
    ctx.fillStyle = '#C8C8C8';
    ctx.fillText('INVOICE', 450, y);

    ctx.font = font(12);
    ctx.fillStyle = 'black';
}

async function printAddress(ctx: Context2D): Promise<void> {
    reset();
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
    ctx.fillText('Kira Pearce', x, y);
    ctx.fillText('Invoice #: ', 380, y);
    ctx.fillText(`INV-00001`, 465, y);
    y += 14;
    ctx.fillText('19a Duggan Avenue', x, y);
    ctx.fillText('Invoice Date: ', 380, y);
    ctx.fillText(`${getDate()}`, 475, y);
    y += 14;
    ctx.fillText('Glengowrie, 5044', x, y);
    ctx.fillText('Invoice Due: ', 380, y);
    ctx.fillText(`${getDate()}`, 475, y);
    y += 14;
    ctx.fillText('South Australia, Australia', x, y);
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

async function printRow(num: string) {
    return num;
}

async function newPage(ctx: Context2D, rowY: number, numOfRows: number) {
    ctx.addPage();
    await printHeader(ctx);
    await printRowHeader(ctx, rowY - 20);
    await printRowBoxes(ctx, rowY, numOfRows);
}

async function printSummary(ctx: Context2D, totalCost: number) {
    reset();
    ctx.strokeStyle = 'rgb(100, 100, 100)';
    ctx.fillStyle = 'black';

    y = 644;

    const valueY = 13;
    const subTotal = (totalCost * 0.9).toFixed(2);
    const GST = (totalCost * 0.1).toFixed(2);

    newBox(true);
    ctx.fillText('Sub Total', x, y - 2);
    textRight();
    ctx.fillText(`$${subTotal}`, x, y + valueY);

    newBox();
    ctx.fillText('GST', x, y - 2);
    textRight();
    ctx.fillText(`$${GST}`, x, y + valueY);

    newBox();
    ctx.fillText('Total', x, y - 2);
    textRight();
    ctx.fillText(`$${totalCost.toFixed(2)}`, x, y + valueY);

    function newBox(first = false) {
        if (!first) y += 30;
        x = 405;
        ctx.textAlign = 'start';
        ctx.font = font(10, 'bold');
        ctx.strokeRect(x, y, 140, 16);
    }

    function textRight() {
        ctx.font = font(12);
        ctx.textAlign = 'end';
        x = 543;
    }
}

async function printNotes(ctx: Context2D) {
    reset();
    ctx.strokeStyle = 'rgb(100, 100, 100)';
    ctx.fillStyle = 'black';
    const notes =
        'Ut reprehenderit officia et eu. Enim enim ea aliquip non sint. Officia incididunt sit eiusmod minim qui proident sint in nulla irure ad. Nulla est ea id aliquip eu cillum tempor consequat irure adipisicing nostrud tempor et nisi. Proident elit ut quis reprehenderit non ex laboris dolor ex amet dolor qui.'.replace(
            RegExp(/\s/),
            ' '
        );

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

function getDate(): string {
    let date = new Date();
    const ts = date.valueOf() - date.getTimezoneOffset() * 60000;
    date = new Date(ts);
    const formattedTime = formatTime(date);
    return formattedTime;
}

function formatTime(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return day + '/' + month + '/' + year;
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

createPDF();

export { createPDF };
