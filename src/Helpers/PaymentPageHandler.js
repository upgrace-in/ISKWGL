'use client'
import { createContext, useContext, useState } from 'react';
import { useRouter } from "next/navigation"
import { useDonation } from './DonationContext';
export function useDonate() {
    const router = useRouter();
    const { setDonationData } = useDonation();

    const handleDonateClick = (price, reason, seva) => {
        setDonationData({
            amount: price,
            reason: reason,
            seva: seva
        });

        router.push('/payment-page');
    };

    return { handleDonateClick };
}