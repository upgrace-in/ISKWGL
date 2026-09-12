"use client";

import React, { useState } from 'react';
import { useDonateTest } from "@/Helpers/PaymentPageHandler-copy";
import DirectDonation from "@/Components/Direct_donation_and_80G"
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import './DonationPage.css';

const DonationPage = () => {
    const [selectedAmount, setSelectedAmount] = useState(501);
    const [navOpen, setNavOpen] = useState(false)
    const { handleDonateClick } = useDonateTest();

  const sevaOptions = [
    { title: "New Dress for Lordships", amount: 30000 },
    { title: "250 Devotees Prasadam Seva", amount: 25116 },
    { title: "100 Devotees Prasadam Seva", amount: 10116 },
    { title: "60 Devotees Prasadam Seva", amount: 6116 },
    { title: "30 Devotees Prasadam Seva", amount: 3116 },
    { title: "15 Devotees Prasadam Seva", amount: 1516 },
    { title: "Abhishekam Seva", amount: 3016 }, 
    { title: "Flower Decoration Seva", amount: 2116 }, 
  ];

  const [selectedSevas, setSelectedSevas] = useState([]);
  const [customAmount, setCustomAmount] = useState('');

  // Toggle checkbox selection
  const handleSevaToggle = (seva) => {
    if (selectedSevas.some((item) => item.title === seva.title)) {
      setSelectedSevas(selectedSevas.filter((item) => item.title !== seva.title));
    } else {
      setSelectedSevas([...selectedSevas, seva]);
    }
  };

  // Calculate total amount from selected sevas + custom amount
  const sevasTotal = selectedSevas.reduce((acc, curr) => acc + curr.amount, 0);
  const finalTotal = sevasTotal + (Number(customAmount) || 0);

  const handleDonate = (e) => {
    e.preventDefault();
    if (finalTotal === 0) {
      alert("Please select at least one seva or enter a custom amount.");
      return;
    }
    const sevaNames = selectedSevas.map(s => s.title).join(", ");
    // alert(`Proceeding to donate ₹${finalTotal} for: ${sevaNames || 'Custom Donation'}!`);
    handleDonateClick(finalTotal, "Radhashtami" + sevaNames || "Radhashtami Seva", "Radhashtami Seva");
  };

  return (
    <>
                <Header handleNav={() => setNavOpen(!navOpen)} />
                <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
    <div className="donation-page-container">
      <div className="donation-card">
        
        {/* Top Section: Different images for mobile (40% height) and desktop (full width) */}
        <div className="donation-image-container">
          {/* Mobile Image */}
          <img 
            src="/images/radhaastami_mobile.png" 
            alt="Sri Radha Rani Mobile" 
            className="donation-image mobile-img"
          />
          {/* Desktop Image */}
          <img 
            src="/images/radhaastami_desktop.jpg" 
            alt="Sri Radha Rani Desktop" 
            className="donation-image desktop-img"
          />
        </div>
        <div className="donation-date-container">
        <div className="info-date-wrapper">
            <span className="info-day">19</span>
            <div className="info-month-year">
                <span className="info-month">Sep</span>
                <span className="info-year">Saturday</span>
            </div>
        </div>
        </div>

        {/* Bottom Section: Multi-Select Seva Options */}
        <div className="donation-content-container">
          <div className="donation-header-wrapper">
            <h1 className="donation-main-title">
              Sri Radhashtami
            </h1>
            <span className="donation-subtitle">
              Seva Opportunity
            </span>
            <p className="donation-blessing-text">
              Celebrate the divine appearance day with your generous contribution
            </p>

            {/* Donation Form */}
            <form onSubmit={handleDonate} className="donation-form">
              <label className="donation-label">
                Select Festival Seva Options (Multi-Select)
              </label>
              
              {/* Seva Options Grid (No scrollbar, displays all neatly) */}
              <div className="seva-options-grid">
                {sevaOptions.map((seva, index) => {
                  const isSelected = selectedSevas.some((item) => item.title === seva.title);
                  return (
                    <div
                      key={index}
                      onClick={() => handleSevaToggle(seva)}
                      className={`seva-card ${isSelected ? 'active' : ''}`}
                    >
                      <div className="seva-info">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div onClick
                          className="seva-checkbox"
                        />
                        <span className="seva-title">{seva.title}</span>
                      </div>
                      <span className="seva-amount">₹{seva.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div className="custom-donation-section">
                <span className="donation-subtext">Custom Donation: </span>
                <div className="donation-input-wrapper">
                  <span className="donation-currency-symbol">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="donation-custom-input"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="donation-submit-btn"
              >
                Contribute Now {finalTotal > 0 ? `(₹${finalTotal.toLocaleString()})` : ''}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>  
        <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
            <DirectDonation />
        </div>
        <Floating />
        
        <Foooter />
    </>
  );
};

export default DonationPage;