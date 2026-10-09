export async function POST(request) {
    try {
        // 1. Read the raw body sent by the SMS gateway (URL-encoded string)

        const textBody = await request.text();

        console.log('Raw Request Body:', textBody);

        // 2. Parse the URL-encoded string into a clean JavaScript object
        const parsedData = Object.fromEntries(new URLSearchParams(textBody));

        // 3. Print the complete response object to your terminal/logs
        console.log('--- SMS WEBHOOK RECEIVED ---');
        console.log('Complete Response Object:', parsedData);

        // Optional: Extract specific fields
        const sender = parsedData.From;
        const messageBody = parsedData.Body;
        console.log(`From: ${sender} | Message: ${messageBody}`);

        // 4. Send the required TwiML (XML) response back to the gateway
        const xmlResponse = `
            <Response>
                <Message>We received your text: "${messageBody}"</Message>
            </Response>
        `;

        return new Response(xmlResponse, {
            status: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
        });

    } catch (error) {
        console.error('Error processing SMS webhook:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}