import { Cashfree } from "cashfree-pg";

Cashfree.XClientId = process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? process.env.CASHFREE_TEST_ID : process.env.CASHFREE_ID;
Cashfree.XClientSecret = process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? process.env.CASHFREE_TEST_SECRET : process.env.CASHFREE_SECRET;
Cashfree.XEnvironment = process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? Cashfree.Environment.SANDBOX : Cashfree.Environment.PRODUCTION

export async function POST(request) {

    try {

        let { name, email, phone, address, pin, amount, pan } = await request.json()

        var rst = {
            "order_amount": parseFloat(amount),
            "order_currency": "INR",
            "order_id": `order_${Math.floor(Math.random() * 1000000)}`,
            "customer_details": {
                "customer_id": phone,
                "customer_phone": phone,
                "customer_name": name,
                "customer_email": email
            },
            "order_meta": {
                "return_url": "https://iskconwarangal.in/#donate"
                // "notify_url": `${process.env.NEXT_PUBLIC_DOMAIN}/api/handleWebhook/`
            },
            "order_tags": {
                "address": address,
                "pin": pin,
                "pan": pan
            }
        };

        return Cashfree.PGCreateOrder("2023-08-01", rst).then((res) => {
            return Response.json({
                response: res.data
            }, { status: 200 })
        }).catch((error) => {
            throw error
        });

    } catch (error) {
        console.log(`Error while creating order: ${error}`)
        return Response.json({
            response: error
        }, { status: 404 })
    }

}