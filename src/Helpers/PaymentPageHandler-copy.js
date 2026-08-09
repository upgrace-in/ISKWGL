'use client'
import { createContext, useContext, useState } from 'react';
import { useRouter } from "next/navigation"
import { useDonation } from './DonationContext';
export function useDonateTest() {
    const router = useRouter();
    const { setDonationData } = useDonation();

    const handleDonateClick = (price, reason, seva) => {
        setDonationData({
            amount: price,
            reason: reason,
            seva: seva
        });

        router.push('/paymentpage');
    };

    return { handleDonateClick };
}