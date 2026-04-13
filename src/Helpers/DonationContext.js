'use client'
import { createContext, useContext, useState } from 'react';

const DonationContext = createContext();

export function DonationProvider({ children }) {
  const [donationData, setDonationData] = useState({ amount: 0, reason: '' });
  return (
    <DonationContext.Provider value={{ donationData, setDonationData }}>
      {children}
    </DonationContext.Provider>
  );
}

export const useDonation = () => useContext(DonationContext);