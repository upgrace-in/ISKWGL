'use client'
import './rathyatrastyles.css'
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom'; // Required for Portals
import { useDonation } from '@/Helpers/DonationContext';
import { useRouter } from 'next/navigation';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Floating from "@/Components/Floating";
import Foooter from "../../Components/footter"
import DirectDonation from "@/Components/Direct_donation_and_80G"
import confetti from 'canvas-confetti';
import '../RathCartDonation/GiftBox.css';
import './HeroSection.css';

// ==========================================
// 1. EXTRACTED GIFTBOX COMPONENT
// ==========================================
const GiftBox = ({ gifts }) => {
    // State is safely inside a functional component!
    const [isShaking, setIsShaking] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    if (!gifts || gifts.length === 0) return null;

    const handleGiftClick = () => {
        setIsShaking(true);

        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
            });

            setIsShaking(false);
            setShowPopup(true);
        }, 600);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="gift-container">
            {/* The Gift Icon */}
            {!showPopup && (
                <div 
                    className={`gift-icon ${isShaking ? 'shaking' : 'pulsing'}`} 
                    onClick={handleGiftClick}
                    role="button"
                    aria-label="Open Gift"
                >
                    🎁
                </div>
            )}

            {/* The Popup Modal using Portals */}
            {showPopup && ReactDOM.createPortal(
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Surprise! Here are your gifts:</h2>
                        <ul className="gift-list">
                            {gifts.map((gift, index) => (
                                <li key={index} className="gift-item">
                                    {/* <img src={gift.picture} alt={gift.title} className="gift-img" /> */}
                                    <span>{gift.title}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="close-btn" onClick={closePopup}>
                            Awesome!
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ==========================================
// 2. MAIN RATHYATRA COMPONENT
// ==========================================
export default function Rathyatra() {
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)
    const { setDonationData } = useDonation();
    const router = useRouter();
    
    const [amount, setAmount] = useState();
    const [isMuted, setIsMuted] = useState(true);
  
    // Create a reference to the video element
    const videoRef = useRef(null);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Removed the buggy global state that used to be here!

    const rathPlans = [
        { title: "Jagannath Seva", count: 250, price: 25116, icon: "/images/rathyatra/Jagannath.png", featured: true, badge: "Maha Patron" , 
            gifts: [
                {title:"Special Puja for Lord Jagannath", picture:"/Icons/Jagannath.png"}, 
                {title:"Puri Flag", picture:"/Icons/Jagannath.png"}, 
                {title:"Acrylic Photo", picture:"/Icons/Jagannath.png"},
                {title:"Glass Cube with Etched Jagannath", picture:"/Icons/Jagannath.png"}, 
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Baladev Seva", count: 150, price: 15116, icon: "/images/rathyatra/Baladev.png", featured: false,
            gifts: [
                {title:"Puri Flag", picture:"/Icons/Jagannath.png"}, 
                {title:"Acrylic Photo", picture:"/Icons/Jagannath.png"},
                {title:"Glass Cube with Etched Jagannath", picture:"/Icons/Jagannath.png"}, 
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Subhadra Seva", count: 100, price: 10116, icon: "/images/rathyatra/Subhadra.png", featured: false,
            gifts: [
                {title:"Puri Flag", picture:"/Icons/Jagannath.png"}, 
                {title:"Acrylic Photo", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Sudarshan Seva", count: 50, price: 5116, icon: "/images/rathyatra/Sudarshan.jpg", featured: false ,
            gifts: [
                {title:"Small Jagannath deities", picture:"/Icons/Jagannath.png"}, 
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Hanuman Seva", count: 20, price: 2116, icon: "/images/rathyatra/Hanuman.jpeg", featured: false ,
            gifts: [
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Garuda Seva", count: 10, price: 1116, icon: "/images/rathyatra/Garuda.jpg", featured: false ,
            gifts: [
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Rath Seva", count: 5, price: 516, icon: "/images/rathyatra/rath.jpg", featured: false ,
            gifts: [
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
    ];

    const handleDonate = (plan) => {
        setDonationData(plan);
        // routing logic if needed...
    };

    return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            
            <div className="hero-page-container">
              <img 
                src="/images/rathyatra/hero-image.png" 
                alt="Rath Yatra Festive Backdrop" 
                className="hero-underlay-image"
              />
              <div className="hero-tint-overlay"></div>
              <div className="hero-video-top-layer">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="actual-overlay-video"
                >
                  <source src="images/Ratha-Yatra-2025.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button className="sound-toggle-btn" onClick={toggleMute}>
                  {isMuted ? '🔊 Sound On' : '🔇 Mute'}
                </button>
              </div>
            </div>

            {/* SEVA CARDS */}
            <section className="seva-grid">
                {rathPlans.map((plan, index) => {
                    const gridClass = index < 3 ? 'row-item-4' : 'row-item-3';
                    const cardClasses = `seva-card ${gridClass} ${index === 0 ? 'premium-gold-card' : ''}`;

                    return (
                        <div key={index} className={cardClasses}>
                            <div className="seva-image-container">
                                <img src={plan.image || plan.icon} alt={plan.title} className="seva-main-img" />
                            </div>

                            <div className="seva-content">
                                <div className="title-badge">
                                    <span className="gold-star">✦</span>
                                    <h3>{plan.title}</h3>
                                    <span className="gold-star">✦</span>
                                </div>

                                {plan.count && (
                                    <p className="seva-subtitle">(Annadan for {plan.count} members)</p>
                                )}
                                
                                <div className="side-by-side-container">
                                    <span>Click here know what Donor will get   -- </span>
                                    {/* Call the isolated component cleanly */}
                                    <GiftBox gifts={plan.gifts} />
                                </div>
                                
                                <button onClick={() => handleDonate(plan)} className="contribute-btn">
                                    <span className="gold-star">✦</span>
                                    Donate {plan.price.toLocaleString()}/-
                                    <span className="gold-star">✦</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </section>
            
            <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
                <DirectDonation />
            </div>
            <Floating />
            <Foooter />
        </>
    );
}