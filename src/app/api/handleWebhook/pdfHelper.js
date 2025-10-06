import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import fs from 'fs';
import path from 'path';

// Register fonts


export const generatePDF = (dict, donation) => {
    const logoPath = path.resolve(process.cwd(), 'public', 'assets', 'iskcon_logo.png');
    const logoBase64 = fs.readFileSync(logoPath, 'base64');

    const docDefinition = {
        content: [
            {
                image: `data:image/png;base64,${logoBase64}`,
                width: 60,
                alignment: 'center'
            },
            { text: 'INTERNATIONAL SOCIETY FOR KRISHNA CONSCIOUSNESS (ISKCON)', style: 'header' },
            { text: 'Founder Acharya: His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada', style: 'subheaderSmallBold' },
            { text: '(Head Office: Hare Krishna Land, Juhu, Mumbai - 400 049)', style: 'subheaderSmallBold' },
            { text: 'Preaching Centre : ISKCON Warangal - Mulugu Road 506007', style: 'subheaderSmall' },
            { text: 'Mob: +91 95156 73115 Email: iskcon.wgl@gmail.com', style: 'subheaderSmall' },
            { text: '(Registered under Bombay Public Trusts Act Vide Registration No. F2179(Bom), PAN-AAATI0017P)', style: 'subheaderSmall' },
            {
                canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 595 - 2 * 40, y2: 0, lineWidth: 1 }
                ],
                margin: [0, 10, 0, 20]
            },
            { text: 'Receipt', style: 'header' }, // Added title "Receipt"
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [{ text: 'Receipt No: ', style: 'boldLabel' }, { text: dict.orderId, style: 'tableValue' }],
                        [{ text: 'Received with thanks from: ', style: 'boldLabel' }, { text: donation.name, style: 'tableValue' }],
                        [{ text: 'Address: ', style: 'boldLabel' }, { text: donation.address, style: 'tableValue' }],
                        [{ text: 'Amount: ', style: 'boldLabel' }, { text: '₹'+ dict.orderAmount, style: 'tableValue' }],
                        [{ text: 'Donor PAN No: ', style: 'boldLabel' }, { text: donation.pan, style: 'tableValue' }],
                        [{ text: 'Mode Of Payment: ', style: 'boldLabel' }, { text: donation.webhookData.paymentMode , style: 'tableValue' }],
                        [{ text: 'Bank: ', style: 'boldLabel' }, { text: donation.webhookData.bank || 'Cashfree Payment Gateway', style: 'tableValue' }],
                        [{ text: 'On Account of: ', style: 'boldLabel' }, { text: 'DONATION', style: 'tableValue' }],
                        [{ text: 'Transaction Timestamp: ', style: 'boldLabel' }, { text: decodeURIComponent(donation.webhookData.txTime), style: 'tableValue' }],
                        [{ text: 'Transaction Reference Id: ', style: 'boldLabel' }, { text: donation.webhookData.referenceId, style: 'tableValue' }]
                    ]
                },
                layout: 'noBorders'
            },
            { text: [{ text: 'Note: ', style: 'boldLabel' }, 'This is a computer generated receipt and does not require a signature'], style: 'subheader', margin: [0, 10, 0, 0] } // Made "Note" bold
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
                alignment: 'center'
            },
            subheader: {
                fontSize: 12,
                margin: [0, 10, 0, 5],
            },
            tableValue: {
                fontSize: 12,
                margin: [0, 0, 0, 0],
            },
            subheaderSmall: {
                fontSize: 10,
                alignment: 'center'
            },
            subheaderSmallBold: {
                fontSize: 10,
                alignment: 'center',
                bold: true
            },
            boldLabel: {
                bold: true
            }
        },
        defaultStyle: {
            font: 'Roboto'
        },
        footer: {
            columns: [
                { text: 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare', alignment: 'center', margin: [0, 10, 0, 0] }
            ]
        }
    };

    return new Promise((resolve, reject) => {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
            resolve(buffer);
        });
    });
};