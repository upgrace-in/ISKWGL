import { load } from "@cashfreepayments/cashfree-js";
import { useEffect, useRef } from "react";

function Checkout({ paymentSessionId }) {
  const cashfreeRef = useRef(null);

  useEffect(() => {
    load({
      mode: process.env.NEXT_PUBLIC_GATEWAY_TYPE === '1' ? "sandbox" : "production"
    }).then((cf) => {
      cashfreeRef.current = cf;
    });

    // Listen for postMessage from Cashfree thank-you page
    const handleMessage = (event) => {
      if (event.data && event.data.order && event.data.order.status === "PAID") {
        console.log("Payment successful:", event.data);
        window.location.href = "/rathyatra";
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const doPayment = () => {
    cashfreeRef.current.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: "_modal",
    });
  };

  return (
    <div className="row">
      <p>Click below to open the checkout page in the current tab</p>
      <button
        type="submit"
        className="btn btn-primary"
        onClick={doPayment}
      >
        Pay Now
      </button>
    </div>
  );
}

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