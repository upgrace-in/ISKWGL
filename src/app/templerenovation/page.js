'use client'
import { useEffect } from 'react';

export default function TempleRenovation() {

  useEffect(() => {
    // Redirect to the payment gateway
    window.location.href = 'https://payments.cashfree.com/forms/iskconwarangaltemplerenovation';
  }, []);

  return (
    <div>
      <p>Please wait while you are being redirected to the payment gateway...</p>
    </div>
  );
}