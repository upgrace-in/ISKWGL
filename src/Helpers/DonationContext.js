'use client'
import { createContext, useContext, useState, useEffect } from 'react';

const DonationContext = createContext();

export function DonationProvider({ children }) {
  // 1. Always start with default values to match server-side rendering
  const [donationData, setDonationData] = useState({ amount: 0, reason: '', seva: '' });

  // 2. Load from sessionStorage only after the component mounts on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('donationData');
      if (saved) {
        try {
          setDonationData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse donation data", e);
        }
      }
    }
  }, []);

  // 3. Automatically save to sessionStorage whenever donationData changes
  useEffect(() => {
    if (typeof window !== 'undefined' && donationData.amount !== 0) {
      sessionStorage.setItem('donationData', JSON.stringify(donationData));
    }
  }, [donationData]);

  return (
    <DonationContext.Provider value={{ donationData, setDonationData }}>
      {children}
    </DonationContext.Provider>
  );
}

export const useDonation = () => useContext(DonationContext);