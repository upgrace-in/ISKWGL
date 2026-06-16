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
        paymentSessionId: paymentSessionId,
        redirectTarget: "_modal",
        // redirectTarget: "_self",
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
            window.location.href = "/rathyatra";
            return { success: "Payment Successful! Thanks for your generous donation..." }
        }
        if (result.paymentDetails) {
            // This will be called whenever the payment is completed irrespective of transaction status
            console.log("Payment has been completed, Check for Payment Status");
            console.log(result.paymentDetails.paymentMessage);
            window.location.href = "/rathyatra";
            return { success: "Payment Successful! Thanks for your generous donation..." }
        }
    });
};

export default Checkout;
// import { load } from "@cashfreepayments/cashfree-js";
// import { useEffect, useRef } from "react";

// function Checkout({ paymentSessionId }) {
//   const cashfreeRef = useRef(null);

//   useEffect(() => {
//     // Initialize SDK once on mount, not inside click handler
//     load({
//       mode: process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? "sandbox" : "production"
//     }).then((cf) => {
//       cashfreeRef.current = cf;
//     });
//   }, []);

//   const doPayment = () => {
//     // No await here — direct user gesture → no popup blocking
//     cashfreeRef.current.checkout({
//       paymentSessionId: paymentSessionId,
//       redirectTarget: "_self",
//     });
//   };

//   return (
//     <div className="row">
//       <p>Click below to open the checkout page in the current tab</p>
//       <button
//         type="submit"
//         className="btn btn-primary"
//         id="renderBtn"
//         onClick={doPayment}
//       >
//         Pay Now
//       </button>
//     </div>
//   );
// }

// export default Checkout;