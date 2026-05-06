'use client'
import React, { useEffect, useState } from 'react';
import { useDonation } from '@/Helpers/DonationContext';
import { useRouter } from 'next/navigation';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Floating from "@/Components/Floating";
import Foooter from "../../Components/footter"
import DirectDonation from "@/Components/Direct_donation_and_80G"
import './donation.css';
export default function RathDonation() {
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)
    const { setDonationData } = useDonation();
    const router = useRouter();
    
    const [amount, setAmount] = useState();

    const rathPlans = [
        { title: "Jagannath Seva", price: 100000, icon: "/Icons/Jagannath.png", featured: true, badge: "Maha Patron" },
        { title: "Baladev Seva", price: 50000, icon: "/Icons/Baladeva.png", featured: false },
        { title: "Subhadra Seva", price: 25000, icon: "/Icons/Subhadra.png", featured: false },
        { title: "Sudarshan Seva", price: 10000, icon: "/Icons/Sudarshan.png", featured: false },
        { title: "Prabhupad Seva", price: 5000, icon: "/Icons/srilaprabhupada.png", featured: false },
    ];
    const fullSponsorship = { 
        title: "Full Rath Construction", 
        price: 1000000, 
        icon: "🛕", 
        description: "Sponsor the complete construction of the new Rath. Your family name will be prominently displayed on the chariot for its lifetime." 
    };

    const handleDonate = (plan) => {
        setDonationData({
            amount: plan.price,
            reason: `New Rath 2026 - ${plan.title}`
        });
        router.push('/payment-page');
    };
    const handleDonateClick = (price, reason) => {
        // We encode the reason to handle spaces and special characters safely
        // const encodedReason = encodeURIComponent(selectedPlan.title);
        // const selectedAmount = selectedPlan.price; // This would be your dynamic state variable
        setDonationData({
            amount: price,
            reason: reason
        });

        router.push('/payment-page');
    };
    const [currentFunding, setCurrentFunding] = useState(0);
    useEffect(() => {
        const fetchTotal = async () => {
            try {
                const response = await fetch('/api/donationforrathcart');
                const data = await response.json();
                setCurrentFunding(data.totalRaised);
            } catch (error) {
                console.error("Error fetching total:", error);
            }
        };

        fetchTotal();
    }, []);

    
    // Mock current funding - in a real app, fetch this from your MongoDB
    // const currentFunding = 0; 
    const goal = 1000000;
    const progressPercent = (currentFunding / goal) * 100;

    return (
        <>
        <Header handleNav={() => setNavOpen(!navOpen)} />
        <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
        <div className="rath-page">
            {/* HERO SECTION */}
            {/* <section className="rath-hero" style={{ '--hero-bg': `url('/images/rath-3.png')` }}>
                <div className="hero-overlay-1">
                    <h2 className="year-tag">THIS YEAR 2026</h2>
                    <h1>{"Let\'s"} build our <span className="gold-text">NEW RATH</span></h1>
                    <p>For Jagannath, Baladev & Subhadra Maharani</p>
                </div>
            </section> */}

            <section className="rath-hero-container">
    <picture>
        {/* MOBILE IMAGE: Shown when screen is 768px or less */}
        <source 
            media="(max-width: 768px)" 
            srcSet="/images/rath-mobile-2.png" 
        />
        {/* DESKTOP IMAGE: Default shown for larger screens */}
        <img 
            src="/images/rath-6.png" 
            alt="Rath Construction" 
            className="hero-image" 
        />
    </picture>

    <div className="hero-overlay-text">
        <h2 className="year-tag">THIS YEAR 2026</h2>
        <h1>{"Let\'s"} build our <span className="gold-text">NEW RATH</span></h1>
        <p>For Jagannath, Baladev & Subhadra Maharani</p>
    </div>
</section>

            {/* PROGRESS TRACKER */}
            <section className="progress-container">
                <div className="progress-header">
                    <span class="label-target">Target: ₹10,00,000</span>
                    <span class="label-raised">Raised: ₹{currentFunding.toLocaleString()}</span>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
                        {/* The Rath Wheel from image_b6c0d9.png */}
                        <img src="Icons/wheel.png" className="progress-wheel-icon" alt="wheel" />
                    </div>
                </div>
            </section>

            {/* SEVA CARDS */}
            <section className="seva-grid">
                {rathPlans.map((plan, index) => {
                    // First 3 items (index 0, 1, 2) get 'row-item-3'
                    // Last 2 items (index 3, 4) get 'row-item-2'
                    const gridClass = index < 3 ? 'row-item-3' : 'row-item-2';

                    return (
                        <div key={index} className={`seva-card ${gridClass}`}>
                            {/* {plan.badge && <span className="maha-badge">{plan.badge}</span>} */}
                            <div className="seva-icon"><img src={plan.icon} width="70" height="70"/></div>
                            <h3>{plan.title}</h3>
                            <p className="seva-price">₹{plan.price.toLocaleString()}</p>
                            <button onClick={() => handleDonate(plan)} className="contribute-btn">
                                Contribute Seva
                            </button>
                        </div>
                    );
                })}
            </section>
            {/* FULL SPONSORSHIP SECTION */}
            <section className="full-rath-sponsor">
                <div className="sponsor-banner">
                    <div className="sponsor-content">
                        <span className="premium-tag">PREMIUM SEVA</span>
                        <h2>Sponsor the Full Rath Cart</h2>
                        <p>This seva covers the entire wood, carving, and construction costs.</p>
                        <div className="price-tag">₹10,00,000</div>
                        <button onClick={() => handleDonate(fullSponsorship)} className="grand-donate-btn">
                            SPONSOR ENTIRE RATH
                        </button>
                    </div>
                </div>
            </section>
            <div className="donation-card-wrapper" style={{ maxWidth:"1300px", margin:"auto auto auto auto", backgroundColor:"white"}}>
                <h3>Custom Donation</h3>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDonateClick(amount, "New Rath 2026 - Rath Cart Construction");
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
        </div>
        <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
            <DirectDonation />
        </div>
        <Floating />
        
        <Foooter />
        </>
    );
}