'use client'
import React from 'react';
import SideNav from "../../Components/SideNav"
import axios from 'axios'
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import DirectDonation from "@/Components/Direct_donation_and_80G"
import Header from "../../Components/Header"
import "./adhikamaas.css"
import { useDonate } from "@/Helpers/PaymentPageHandler";
import { 
  FaLeaf, 
  FaCow, 
  FaFireFlameCurved, 
  FaFireFlameSimple, 
  FaBowlFood, 
  FaOm 
} from 'react-icons/fa6';
export default function AdhikaMaasPage({}) {
    const [navOpen, setNavOpen] = useState(false)
    const [amount, setAmount] = useState();
    const { handleDonateClick } = useDonate();
    
    const scrollToDonation = () => {
        donationRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const donationoptions = {
        'Anna Daan': [
            { title: "AnnaDaan(For 20 People)", price: 516},
            { title: "AnnaDaan(For 40 People)", price: 1016},
            { title: "AnnaDaan(For 60 People)", price: 1516},
            { title: "AnnaDaan(For 100 People)", price: 2516},
            { title: "AnnaDaan(For 200 People)", price: 5016},
        ],
        'Go Seva': [
            { title: "Feed 1 Cow One Day", price: 116},
            { title: "Feed 2 Cows One Day", price: 216},
            { title: "Feed 2 Cows Two Days", price: 416},
            { title: "Feed 1 Cows Five Days", price: 516},
            { title: "Feed 2 Cows Five Days", price: 1016},
        ],
        'Devotee AnnaDaan': [
            { title: "AnnaDaan(For 5 Devotees)", price: 516},
            { title: "AnnaDaan(For 10 Devotees)", price: 1016},
            { title: "AnnaDaan(For 15 Devotees)", price: 1516},
            { title: "AnnaDaan(For 20 Devotees)", price: 2016},
            { title: "AnnaDaan(For 50 Devotees)", price: 5016},
        ]
    }

    const sevas = [
        { title: "Adhika Maas Vigraha Pushpa Mala Seva", price: 516, icon: <FaLeaf />, featured: true, badge: "Maha Patron" },
        { title: "Adhika Maas Go Seva", price: 1116, icon: <FaCow />, featured: false },
        { title: "Adhika Maas Vigraha Harati Seva", price: 1516, icon: "/Icons/Subhadra.png", featured: false },
        { title: "Adhika Maas Vigraha Naivedya Seva", price: 2116, icon: "/Icons/Sudarshan.png", featured: false },
        { title: "Adhika Maas Vaishnava Prasada Seva", price: 3116, icon: "/Icons/srilaprabhupada.png", featured: false },
    ];

    // 2. Extract the category names from the object keys
    const categories = Object.keys(donationoptions);

    // 3. Set the initial state to the first category ('Anna Daan')
    const [activeCategory, setActiveCategory] = useState(categories[0]);

    // 4. Dynamically grab the correct options based on the clicked category
    const currentDonationOptions = donationoptions[activeCategory];

    return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            <section className="image-hero-container">
                <picture>
                    {/* MOBILE IMAGE: Shown when screen is 768px or less */}
                    {/* <source 
                        media="(max-width: 768px)" 
                        srcSet="/images/rath-mobile-2.png" 
                    /> */}
                    {/* DESKTOP IMAGE: Default shown for larger screens */}
                    <img 
                        src="/images/poster-2.jpeg" 
                        alt="Rath Construction" 
                        className="hero-image" 
                    />
                </picture>
                <div className="description-section">
                    {/* Spiritual Significance Paragraph */}
                    <p className="hero-description">
                        Purushottam Maas is the most sacred month dedicated to Lord Krishna. <b style={{color:"#6b2d2d"}}>Offering charity</b> during this divine period brings <b>unparalleled spiritual growth, inner peace, removal of karmic obstacles, and eternal blessings of Shri Krishna.</b>
                    </p>
                </div>
            
                
            </section>
            <div className="donation-list">
                <main className="donation-main-card">
                    {/* 5. Map over the dynamically selected array */}
                    {sevas.map((tier, index) => (
                        <div key={index} className="donation-row">
                            <span className="meal-count">{tier.title}</span>
                            <button className="donate-action-btn" onClick={() =>handleDonateClick(tier.price, tier.title)}>
                            Donate ₹{tier.price.toLocaleString('en-IN')}
                            </button>
                        </div>
                    ))}
                </main>
            </div>
            <div className="donation-container">
                {/* Sidebar Section */}
                <nav className="donation-sidebar">
                    <ul>
                    {categories.map((cat) => (
                        <li
                        key={cat}
                        className={activeCategory === cat ? 'active' : ''}
                        onClick={() => setActiveCategory(cat)}
                        >
                        {cat}
                        </li>
                    ))}
                    </ul>
                </nav>
                {/* Main Donation List */}
                <main className="donation-main-card">
                    {/* 5. Map over the dynamically selected array */}
                    {currentDonationOptions.map((tier, index) => (
                        <div key={index} className="donation-row">
                            <span className="meal-count">{tier.title}</span>
                            <button className="donate-action-btn" onClick={() =>handleDonateClick(tier.price, "Adhika Maas " + tier.title)}>
                            Donate ₹{tier.price.toLocaleString('en-IN')}
                            </button>
                        </div>
                    ))}
                </main>
            </div>
            <div className="custom-donation-section">
                <h3>Custom Donation</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDonateClick(amount, "Adhika Maas Custom Donation");
                    }}
                    className = "custom-dination-container"
                    >
                    {/* Input Section */}
                    <span style={{ color: '#4b5563', fontWeight: '600' }}>
                        <b>₹</b>
                    </span>

                    <div className="inputWrapper">
                        <input
                        type="number"
                        placeholder="Amount"
                        required
                        min="1"
                        onChange={(e) => setAmount(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        className="inputField"
                        />
                    </div>

                    {/* Button */}
                    <button
                        className="button"
                        type="submit"
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#e8e8e8'}
                    >
                        Donate Now
                    </button>
                </form>  
            </div>    
            <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
                <DirectDonation />
            </div>
            <Foooter />
            <Floating />
        </>
    );
}