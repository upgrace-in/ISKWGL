import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';

// Configure your Google Sheets API credentials and spreadsheet details
const SHEET_ID = '1Ex0YOzFzJcgy6t4JzKdwkENHI-RoDDQuxsxAqpkT5lM';
const SHEET_NAME = 'Donations';

// If you want to use a key file, set the path here
const serviceAccountKeyFile = path.join(process.cwd(), 'donationtracker-462214-1ff64693b85c.json'); // Place your key file at project root

async function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountKeyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const phone = formData.get('phone');
        const amount = parseFloat(formData.get('amount'));
        if (!phone || isNaN(amount)) {
            return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
        }

        const sheets = await getSheetsClient();

        // Fetch the sheet data
        const getRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: SHEET_NAME,
        });

        const rows = getRes.data.values || [];
        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Sheet is empty' }, { status: 500 });
        }

        // Header row
        const header = rows[0];
        const phoneColIdx = header.findIndex(h => h.toLowerCase().includes('phone'));

        const year = new Date().getFullYear().toString();

        // Find or create year column
        let yearColIdx = header.findIndex(h => h === year);
        if (yearColIdx === -1) {
            // Add year column at the end
            yearColIdx = header.length;
            header.push(year);
            // Update header row in sheet
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${SHEET_NAME}!A1`,
                valueInputOption: 'RAW',
                requestBody: { values: [header] },
            });
            // Add empty cells for all rows for the new year column
            for (let i = 1; i < rows.length; i++) {
                rows[i][yearColIdx] = '';
            }
        }

        // Find row by phone number
        let rowIdx = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][phoneColIdx] === phone) {
                rowIdx = i;
                break;
            }
        }

        if (rowIdx !== -1) {
            // Update existing row
            let currentYearAmount = parseFloat(rows[rowIdx][yearColIdx] || '0');
            if (isNaN(currentYearAmount)) currentYearAmount = 0;
            const newAmount = currentYearAmount + amount;
            rows[rowIdx][yearColIdx] = newAmount;

            // Update the row in the sheet
            const updateRange = `${SHEET_NAME}!F${rowIdx + 1}:${String.fromCharCode(65 + yearColIdx)}${rowIdx + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: updateRange,
                valueInputOption: 'RAW',
                requestBody: { values: [rows[rowIdx].slice(5 , header.length)] },
            });
        } else {
            // Find the first empty S.No slot
            const sNoColIdx = 0; // Assuming S.No is always the first column
            let emptyRowIdx = -1;
            
            for (let i = 1; i < rows.length; i++) {
                if (!rows[i][sNoColIdx] || rows[i][sNoColIdx].trim() === '') {
                    emptyRowIdx = i;
                    break;
                }
            }

            // Prepare new row data
            const newRow = Array(header.length).fill('');
            newRow[sNoColIdx] = emptyRowIdx !== -1 ? emptyRowIdx : rows.length; // Use found empty slot or append
            newRow[phoneColIdx] = phone.toString();
            newRow[yearColIdx] = amount;
            newRow[4] = null;

            if (emptyRowIdx !== -1) {
                // Update existing empty row
                const updateRange = `${SHEET_NAME}!A${emptyRowIdx + 1}:${String.fromCharCode(65 + header.length)}${emptyRowIdx + 1}`;
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SHEET_ID,
                    range: updateRange,
                    valueInputOption: 'RAW',
                    requestBody: { values: [newRow] },
                });
            } else {
                // Append new row if no empty slot found
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SHEET_ID,
                    range: SHEET_NAME,
                    valueInputOption: 'RAW',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: { values: [newRow] },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
