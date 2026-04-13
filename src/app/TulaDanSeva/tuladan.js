'use client'
import React, { useEffect, useState, useRef } from "react"
import axios from 'axios'
import { useRouter } from "next/navigation"
import HandlePayment from "@/Helpers/HandlePayment"
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import "./tuladan.css"
import { FiCopy, FiCheck } from "react-icons/fi";
// Import standard weights and styles
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css'; // Normal weight
import '@fontsource/open-sans/700.css'; // Bold weight
import { ShoppingBag, Wheat, Droplets, Nut, ChevronDown } from 'lucide-react';
import DirectDonation from "@/Components/Direct_donation_and_80G"
import { useDonation } from "@/Helpers/DonationContext";

export default function TulaDanSeva({ }){
    const router = useRouter()
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState('Rice');
    const [weight, setWeight] = useState(1);

    const items = [
        { id: 'Rice', label: 'Donate Rice', icon: ShoppingBag, pricePerKg: 50 },
        { id: 'Wheat', label: 'Donate Wheat Flour', icon: Wheat, pricePerKg: 45 },
        { id: 'Oil', label: 'Donate Edible Oil', icon: Droplets, pricePerKg: 150 },
        { id: 'DryFruits', label: 'Donate Dry Fruits', icon: Nut, pricePerKg: 800 },
    ];
    // Look up the current price based on which ID is selected
    const activeItem = items.find(item => item.id === selectedItem);
    const currentPricePerKg = activeItem ? activeItem.pricePerKg : 0;
    const totalAmount = (weight * currentPricePerKg).toFixed(2);
    const buttonStyle = {
        background: 'linear-gradient(135deg, #d4a054 0%, #6b2d2d 100%)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
    };

    const { setDonationData } = useDonation();
    const handleDonateClick = (amount, reason) => {
        // We encode the reason to handle spaces and special characters safely
        // const encodedReason = encodeURIComponent(selectedPlan.title);
        // const selectedAmount = selectedPlan.price; // This would be your dynamic state variable
        setDonationData({
            amount: amount,
            reason: reason
        });

        router.push('/payment-page');
    };

    return(
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            {/* <section className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <p className="hero-title">Tula Dan Seva</p>
                        <div className="hero-line"></div>
                    </div>
                </div>
            </section> */}
            {/* This image will only show on mobile */}
            <div className="mobile-only-banner">
                <img 
                src="/donateForIMGs/Tula_Dan/tula-dan-warangal.png" 
                alt="Tula Dan Seva Banner" 
                />
            </div>
            {/* --- Modified Story Section Start --- */}
                <div className="ffl-story-container_1">
                {/* Text Section (60%) */}
                    <div className="ffl-story-text-1">
                            <div className="donation-card-wrapper">
                            <img 
                                src="/donateForIMGs/Tula_Dan/tula_danam-warangal.jpeg" /* REPLACE WITH YOUR IMAGE PATH */
                                alt="HHRNSM distributing prasadam to school children"
                                className="story-image-1"
                            />
                            <p>According to puranas, Lord Shree <strong>Krishna</strong> also performed this Tula Daan ritual for his son <strong>Samba</strong> to rescue him from the curse of Brahmins. As per another legend, after the Kurukshetra war between Pandavas and Kauravas, King <strong>Yudhisthir</strong> and his brothers also performed this ritual to get release from the sin done by them by killing their relatives.</p>
                            <div className="about-ffl-section">
                                <h2>Benefits of Performing Tula Daan</h2>
                            </div>
                            <div >
                                <ul >
                                    <li className="benefit-list">According to puranas performing tula daan ritual helps in attaining Vishnulok.</li>
                                    <li className="benefit-list">Offer gratitude and appease deities for blessings, health, and overcoming obstacles.</li>
                                    <li className="benefit-list">Performing this ritual helps in eliminating the negative effects and grah dosh of any of the planets.</li>
                                    <li className="benefit-list">This helps in improving health and cure serious diseases.</li>
                                    <li className="benefit-list">This ritual also helps the individual to progress spiritually as well.</li>
                                    <li className="benefit-list">Symbolizes letting go of material attachments and embracing the power of selfless charity.</li>
                                </ul>
                                <p>and many more ...</p>
                            </div>
                        </div>
                    </div>
                    {/* Image Section (35%) */}
                    <div className="ffl-story-image-wrapper-1">
                            <div className="donation-card-wrapper">
                                
                                {/* <div className="tula-container"> */}
                                {/* <div className="tula-card"> */}
                                    <div className="tula-content">
                                    <h1 className="tula-title">Tula Daan Seva</h1>

                                    <div className="icon-grid">
                                        {items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item.id)}
                                            className={`category-btn ${selectedItem === item.id ? 'active' : ''}`}
                                            >
                                            <div className="icon-circle">
                                                <Icon size={28} strokeWidth={1.5} />
                                            </div>
                                            <span className="category-label">{item.label}</span>
                                            </button>
                                        );
                                        })}
                                    </div>

                                    <div className="input-group">
                                        <label className="label-main">Select {activeItem?.id} weight</label>
                                        <p className="label-sub">( Per KG {currentPricePerKg}₹ )</p>
                                        <select 
                                        className="tula-select"
                                        value={weight}
                                        onChange={(e) => setWeight(Number(e.target.value))}
                                        >
                                        {/* Generate an array from 1 to 200 and map over it */}
                                                                    {Array.from({ length: 200 }, (_, i) => i + 1).map((num) => (
                                                                        <option key={num} value={num}>
                                                                        {num} KG
                                                                        </option>
                                                                    ))}
                                        </select>
                                    </div>
                                    </div>

                                    <div className="action-bar">
                                    <div className="price-display">
                                        <div className="currency-symbol">₹</div>
                                        <span className="total-amount">{(weight * currentPricePerKg).toFixed(2)}</span>
                                    </div>

                                    <button className="donate-btn" onClick={() =>handleDonateClick((weight * currentPricePerKg).toFixed(2), "Tula Dan Seva - "+activeItem.id)}>Donate</button>
                                    </div>
                                {/* </div> */}
                                {/* </div> */}
                            </div>
                    </div>
                </div>
                
                <div style={{margin:"auto", maxWidth:"1300px"}}>
                    <DirectDonation />
                </div>
                <Foooter />  
                <Floating /> 
        </>
    );
}