'use client'
import './rathyatrastyles.css'
import React, { useEffect, useState, useRef } from 'react';
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
import ReactDOM from 'react-dom'; // NEW: Import this
export default function rathyatra() {
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
        // Toggle the actual DOM element's muted property
        videoRef.current.muted = !isMuted;
        // Update our React state to change the button text
        setIsMuted(!isMuted);
        }
    };

    const [isShaking, setIsShaking] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    // Sample list of gifts
    const gifts = [
    "🎁 1 Month Free Subscription",
    "🎧 Wireless Headphones",
    "👕 Exclusive Merchandise",
    "⭐ 500 Bonus Points"
    ];

    const handleGiftClick = () => {
    // 1. Trigger the shaking animation
    setIsShaking(true);

    // 2. Wait for the shake to finish, then explode and show popup
    setTimeout(() => {
        // Trigger confetti explosion
        confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }, // Starts slightly below the top of the screen
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
        });

        // Stop shaking and show the modal
        setIsShaking(false);
        setShowPopup(true);
    }, 600); // 600ms matches the CSS animation duration
    };

    const closePopup = () => {
    setShowPopup(false);
    };

    const rathPlans = [
        { title: "Jagannath Seva", count: 250, price: 25116, icon: "/Images/rathyatra/Jagannath.png", featured: true, badge: "Maha Patron" , 
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
        { title: "Baladev Seva", count: 150, price: 15116, icon: "/Images/rathyatra/Baladev.png", featured: false,
            gifts: [
                {title:"Puri Flag", picture:"/Icons/Jagannath.png"}, 
                {title:"Acrylic Photo", picture:"/Icons/Jagannath.png"},
                {title:"Glass Cube with Etched Jagannath", picture:"/Icons/Jagannath.png"}, 
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Subhadra Seva", count: 100, price: 10116, icon: "/Images/rathyatra/Subhadra.png", featured: false,
            gifts: [
                {title:"Puri Flag", picture:"/Icons/Jagannath.png"}, 
                {title:"Acrylic Photo", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Sudarshan Seva", count: 50, price: 5116, icon: "/Images/rathyatra/Sudarshan.jpg", featured: false ,
            gifts: [
                {title:"Small Jagannath deities", picture:"/Icons/Jagannath.png"}, 
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Hanuman Seva", count: 20, price: 2116, icon: "/Images/rathyatra/Hanuman.jpeg", featured: false ,
            gifts: [
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Garuda Seva", count: 10, price: 1116, icon: "/Images/rathyatra/Garuda.jpg", featured: false ,
            gifts: [
                {title:"Jagannath Agarbatti", picture:"/Icons/Jagannath.png"}, 
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
        { title: "Rath Seva", count: 5, price: 516, icon: "/Images/rathyatra/rath.jpg", featured: false ,
            gifts: [
                {title:"Maha Prasadam Box", picture:"/Icons/Jagannath.png"},
                {title:"Jagannath Keychain", picture:"/Icons/Jagannath.png"},
            ]
        },
    ];

    return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            <div className="hero-page-container">
      
      {/* The actual Image Element covering the main page */}
      <img 
        src="/Images/rathyatra/hero-image.png" 
        alt="Rath Yatra Festive Backdrop" 
        className="hero-underlay-image"
      />

      {/* Optional: Subtle tint layer to help the video stand out */}
      <div className="hero-tint-overlay"></div>

      {/* The Video Element running on top of the photo */}
      <div className="hero-video-top-layer">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="actual-overlay-video"
        >
          <source src="Images/Ratha-Yatra-2025.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Custom sound button */}
        <button className="sound-toggle-btn" onClick={toggleMute}>
          {isMuted ? '🔊 Sound On' : '🔇 Mute'}
        </button>
      </div>

    </div>
            {/* SEVA CARDS */}
            <section className="seva-grid">
                {rathPlans.map((plan, index) => {
                    // First 3 items (index 0, 1, 2) get 'row-item-3'
                    // Last 2 items (index 3, 4) get 'row-item-2'
                    const gridClass = index < 3 ? 'row-item-4' : 'row-item-3';

                    // NEW: Add 'premium-gold-card' class ONLY for the first card (index 0)
                    const cardClasses = `seva-card ${gridClass} ${index === 0 ? 'premium-gold-card' : ''}`;

                    // These states are now isolated to THIS specific gift box
                    const [isShaking, setIsShaking] = useState(false);
                    const [showPopup, setShowPopup] = useState(false);

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
                        <div key={index} className={cardClasses}>
                            
                            {/* Top Main Image Container */}
                            <div className="seva-image-container">
                                {/* Replace plan.image with your actual large image property */}
                                <img src={plan.image || plan.icon} alt={plan.title} className="seva-main-img" />
                            </div>

                            {/* Bottom Content Area (Overlaps the image) */}
                            <div className="seva-content">
                                
                                {/* Maroon Title Badge */}
                                <div className="title-badge">
                                    <span className="gold-star">✦</span>
                                    <h3>{plan.title}</h3>
                                    <span className="gold-star">✦</span>
                                </div>

                                {/* Italic Subtitle */}
                                {plan.count && (
                                    <p className="seva-subtitle">(Annadan for {plan.count} members)</p>
                                )}
                                <div className="side-by-side-container">
                                    <span>Click here know what Doner will get   -- </span>
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

            {/* The Popup Modal */}
            {showPopup && ReactDOM.createPortal(
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Surprise! Here are your gifts:</h2>
                        <ul className="gift-list">
                            {/* We map over the passed-in gifts array */}
                            {rathPlans[index].gifts.map((gift, index) => (
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
                                </div>
                                {/* Price Tag acting as the Contribute Button */}
                                <button onClick={() => handleDonate(plan)} className="contribute-btn">
                                    <span className="gold-star">✦</span>
                                    Donate {plan.price.toLocaleString()}/-
                                    <span className="gold-star">✦</span>
                                </button>

                            </div>
                        </div>
                        // <div key={index} className={`seva-card ${gridClass}`}>
                        //     {/* {plan.badge && <span className="maha-badge">{plan.badge}</span>} */}
                        //     <div className="seva-icon"><img src={plan.icon} width="70" height="70"/></div>
                        //     <h3>{plan.title}</h3>   
                        //     <p className="seva-price">₹{plan.price.toLocaleString()}</p>
                        //     <div className="gift-container">
                        //         {/* The Gift Icon */}
                        //         {!showPopup && (
                        //             <div 
                        //             className={`gift-icon ${isShaking ? 'shaking' : 'pulsing'}`} 
                        //             onClick={handleGiftClick}
                        //             role="button"
                        //             aria-label="Open Gift"
                        //             >
                        //             🎁
                        //             </div>
                        //         )}

                        //         {/* The Popup Modal */}
                        //         {showPopup && (
                        //             <div className="popup-overlay" onClick={closePopup}>
                        //             <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        //                 <h2>Surprise! Here are your gifts:</h2>
                        //                 <ul className="gift-list">
                        //                 {gifts.map((gift, index) => (
                        //                     <li key={index}>{gift}</li>
                        //                 ))}
                        //                 </ul>
                        //                 <button className="close-btn" onClick={closePopup}>
                        //                 Awesome!
                        //                 </button>
                        //             </div>
                        //             </div>
                        //         )}
                        //     </div>
                        //     <button onClick={() => handleDonate(plan)} className="contribute-btn">
                        //         Contribute Seva
                        //     </button>
                        // </div>
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