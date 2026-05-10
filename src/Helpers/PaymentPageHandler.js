'use client'
import { createContext, useContext, useState } from 'react';
import { useRouter } from "next/navigation"
import { useDonation } from './DonationContext';
export function useDonate() {
    const router = useRouter();
    const { setDonationData } = useDonation();

    const handleDonateClick = (price, reason) => {
        setDonationData({
            amount: price,
            reason: reason
        });

        router.push('/payment-page');
    };

    return { handleDonateClick };
}