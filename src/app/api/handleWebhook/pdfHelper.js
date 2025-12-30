import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : 'Only';
    return str;
};

export const generatePDF = async (dict, donation) => {
    try {
        // Paths
        const templateDir = path.resolve(process.cwd(), 'src/app/api/handleWebhook/templates');
        const publicAssetsDir = path.resolve(process.cwd(), 'public/assets');

        // Load Assets
        const loadAsset = (filename) => {
            const publicPath = path.join(publicAssetsDir, filename);
            try {
                if (fs.existsSync(publicPath)) {
                    return `data:image/png;base64,${fs.readFileSync(publicPath, 'base64')}`;
                }
            } catch (e) {
                console.warn(`Asset ${filename} not found in public/assets`);
            }
            return '';
        };

        const logoDataUrl = loadAsset('logo.png') || loadAsset('iskcon_logo.png') || loadAsset('iskcon_logo.jpg');
        const badgeDataUrl = loadAsset('badge.png');
        const watermarkDataUrl = loadAsset('watermark_pattern.png');

        // Date Formatting
        const txDate = donation.webhookData?.txTime ? new Date(decodeURIComponent(donation.webhookData.txTime)) : new Date();
        const formattedDate = txDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        // Amount in Words
        const amountWords = numberToWords(dict.orderAmount);

        // Sidebar Year
        const currentYear = new Date().getFullYear();

        // Load Templates
        let htmlTemplate = fs.readFileSync(path.join(templateDir, 'receipt.html'), 'utf-8');

        // Prepare Placeholders
        const badgeHtml = badgeDataUrl ? `<img src="${badgeDataUrl}" alt="Founder Acharya Badge" style="width: 100%; height: 100%; object-fit: contain;">` : '';

        const placeholders = {
            '{{currentYear}}': currentYear,
            '{{logoDataUrl}}': logoDataUrl,
            '{{badgeHtml}}': badgeHtml,
            '{{watermarkDataUrl}}': watermarkDataUrl,
            '{{orderId}}': dict.orderId,
            '{{formattedDate}}': formattedDate,
            '{{amountWords}}': amountWords,
            '{{orderAmount}}': dict.orderAmount,
            '{{donorName}}': donation.name,
            '{{donorAddress}}': donation.address || '',
            '{{donorPin}}': donation.pin || '',
            '{{donorPan}}': donation.pan || '',
            '{{donorPhone}}': donation.phone,
            '{{donorEmail}}': donation.email || '',
            '{{paymentMode}}': donation.webhookData?.paymentMode || 'Online',
            '{{referenceId}}': donation.webhookData?.referenceId || 'N/A',
            '{{donatedFor}}': donation.donatedFor || 'General'
        };

        // Replace Placeholders
        let htmlContent = htmlTemplate;
        for (const [key, value] of Object.entries(placeholders)) {
            htmlContent = htmlContent.split(key).join(value);
        }

        let browser;
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            // Serverless environment (Vercel/Lambda)
            const chromium = (await import('@sparticuz/chromium')).default;
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            // Local development (Mac fallback)
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            });
        }
        const page = await browser.newPage();

        // Set content and wait for load
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Calculate content height
        const height = await page.evaluate(() => {
            return document.documentElement.offsetHeight;
        });

        const pdfBuffer = await page.pdf({
            width: '794px', // Standard A4 width at 96 DPI
            height: `${height + 2}px`, // Content height + tiny safety buffer
            printBackground: true,
            margin: {
                top: '0',
                bottom: '0',
                left: '20px',
                right: '20px'
            }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
};