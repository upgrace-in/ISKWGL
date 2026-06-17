import { load } from "@cashfreepayments/cashfree-js";
import { useEffect } from "react";

function HandlePayment({ data }) {
    useEffect(() => {
        if (!data) return;

        const handlePayment = async () => {
            const cashfree = await load({
                mode: process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? "sandbox" : "production"
            });
            cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: "_self",
            });
        };

        handlePayment();
    }, [data]);

    return null;
}

export default HandlePayment;