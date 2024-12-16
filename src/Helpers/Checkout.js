import { load } from "@cashfreepayments/cashfree-js";

let cashfree;
var initializeSDK = async function () {
    cashfree = await load({
        mode: process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? "sandbox" : "production"
    });
}
initializeSDK();

const Checkout = async (paymentSessionId) => {
    if (!paymentSessionId) return
    let checkoutOptions = {
        paymentSessionId,
        // redirectTarget: "_modal",
        redirectTarget: "_self",
    };
    return cashfree.checkout(checkoutOptions).then((result) => {
        if (result.error) {
            // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
            console.log("User has closed the popup, Check for Payment Status");
            console.log(result.error);
            return { error: result.error }
        }
        if (result.redirect) {
            // This will be true when the payment redirection page couldnt be opened in the same window
            // This is an exceptional case only when the page is opened inside an inAppBrowser
            // In this case the customer will be redirected to return url once payment is completed
            console.log("Payment will be redirected");
            return { success: "Payment Successful! Thanks for your generous donation..." }
        }
        if (result.paymentDetails) {
            // This will be called whenever the payment is completed irrespective of transaction status
            console.log("Payment has been completed, Check for Payment Status");
            console.log(result.paymentDetails.paymentMessage);
            return { success: "Payment Successful! Thanks for your generous donation..." }
        }
    });
};

export default Checkout;