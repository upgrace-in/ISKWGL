'use client'
import './rathyatrastyles.css'
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDonation } from '@/Helpers/DonationContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Floating from "@/Components/Floating";
import Foooter from "../../Components/footter"
import DirectDonation from "@/Components/Direct_donation_and_80G"
import confetti from 'canvas-confetti';
import '../RathCartDonation/GiftBox.css';
import './HeroSection.css';
import './LeafyDivider.css';
import './FestivalInfo.css';
import './LotusHighlights.css';
import { useDonate } from "@/Helpers/PaymentPageHandler";


const DonationSuccessModal = ({ gifts, onClose }) => {
    // Fire confetti as soon as the success modal opens!
    useEffect(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#d4a054', '#5a0209']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#d4a054', '#5a0209']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    if (!gifts || gifts.length === 0){
        return ReactDOM.createPortal(
            <div className="success-modal-overlay">
                <div className="success-modal-content">
                    
                    <div className="success-header">
                        <h2>🎊 Thank You for Your Seva! 🎊</h2>
                        <p>May the grace of Lord Jagannath be always upon you and your family.</p>
                    </div>
                    {/* THE IMPORTANT INSTRUCTION BOX */}
                    <div className="success-instruction-box">
                        <strong>📍 Important Note:</strong>
                        <p>Please come for Jagannath Rath Yatra on 20 July, Monday</p>
                    </div>

                    <button className="success-close-btn" onClick={onClose}>
                        Hare Krishna 🙏
                    </button>
                </div>
            </div>,
            document.body
        );
    }

    return ReactDOM.createPortal(
        <div className="success-modal-overlay">
            <div className="success-modal-content">
                
                <div className="success-header">
                    <h2>🎊 Thank You for Your Seva! 🎊</h2>
                    <p>May the grace of Lord Jagannath be always upon you and your family. Here are your Gifts:</p>
                </div>

                <ul className="success-gift-list">
                    {gifts.map((gift, index) => (
                        <li key={index} className="success-gift-item">
                            {gift.img && (
                                <img src={gift.img} alt={gift.title} className="success-gift-img" />
                            )}
                            <span className="success-gift-text">{gift.title}</span>
                        </li>
                    ))}
                </ul>

                {/* THE IMPORTANT INSTRUCTION BOX */}
                <div className="success-instruction-box">
                    <strong>📍 Important Note:</strong>
                    <p>Please bring your donation receipt received on WhatsApp to <b>Venkateshwara Garden</b> on Rath Yatra day to receive your gifts.</p>
                </div>

                <button className="success-close-btn" onClick={onClose}>
                    Hare Krishna 🙏
                </button>
            </div>
        </div>,
        document.body
    );
};
// 1. EXTRACTED GIFTBOX COMPONENT
const GiftBox = ({ gifts, plan, onDonate }) => {
    const [isShaking, setIsShaking] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    if (!gifts || gifts.length === 0) return null;

    const handleGiftClick = () => {
        setIsShaking(true);
        setTimeout(() => {
            confetti({
                particleCount: 150, spread: 80, origin: { y: 0.6 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
            });
            setIsShaking(false);
            setShowPopup(true);
        }, 600);
    };

    const closePopup = () => setShowPopup(false);

    return (
        <div className="gift-container">
            {!showPopup && (
                <div 
                    className={`gift-icon ${isShaking ? 'shaking' : 'pulsing'}`} 
                    onClick={handleGiftClick} role="button" aria-label="Open Gift"
                >
                    🎁
                </div>
            )}

            {showPopup && ReactDOM.createPortal(
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        {/* NEW: Top Right Close Icon */}
                        <button className="popup-close-icon" onClick={closePopup} aria-label="Close">
                            ✕
                        </button>
                        <h2>Surprise! Here are your gifts:</h2>
                        <ul className="gift-list">
                            {gifts.map((gift, index) => (
                                <li key={index} className="gift-item">
                                    {/* NEW: Display the image if it exists */}
                                    {gift.img && (
                                        <img src={gift.img} alt={gift.title} className="gift-item-img" />
                                    )}
                                    <span className="gift-item-text">{gift.title}</span>
                                </li>
                            ))}
                        </ul>
                        {/* NEW: Action buttons wrapper */}
                        <div className="popup-actions">
                            
                            {/* PREMIUM DONATE BUTTON */}
                            {plan && onDonate && (
                                <button 
                                    className="contribute-btn" 
                                    onClick={() =>onDonate(plan.price, plan.title)}
                                >
                                    <span className="gold-star">✦</span>
                                    Donate ₹{plan.price.toLocaleString()}/-
                                    <span className="gold-star">✦</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// 2. EXTRACTED LEAFY DIVIDER COMPONENT
const LeafyDivider = ({ text, svgWidth = "180px" }) => {
    return (
        <div className="leafy-divider-container">
        <div className="leafy-branch">
            <svg viewBox="0 0 150 30" className="leafy-svg left-svg" style={{ '--custom-width': svgWidth }}>
            <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
                <line x1="15" y1="15" x2="150" y2="15" />
                <path d="M 15,15 C 5,15 2,5 8,3 C 12,1 16,6 12,9 C 9,11 6,8 8,6" />
                <path d="M 15,15 C 5,15 2,25 8,27 C 12,29 16,24 12,21 C 9,19 6,22 8,24" />
                <path d="M 35,15 Q 40,3 50,4 Q 47,12 35,15" />
                <path d="M 65,15 Q 70,27 80,26 Q 77,18 65,15" />
                <path d="M 95,15 Q 100,3 110,4 Q 107,12 95,15" />
                <path d="M 125,15 Q 130,27 140,26 Q 137,18 125,15" />
            </g>
            </svg>
        </div>
        <span className="leafy-divider-text">{text}</span>
        <div className="leafy-branch">
            <svg viewBox="0 0 150 30" className="leafy-svg right-svg" style={{ '--custom-width': svgWidth }}>
            <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
                <line x1="15" y1="15" x2="150" y2="15" />
                <path d="M 15,15 C 5,15 2,5 8,3 C 12,1 16,6 12,9 C 9,11 6,8 8,6" />
                <path d="M 15,15 C 5,15 2,25 8,27 C 12,29 16,24 12,21 C 9,19 6,22 8,24" />
                <path d="M 35,15 Q 40,3 50,4 Q 47,12 35,15" />
                <path d="M 65,15 Q 70,27 80,26 Q 77,18 65,15" />
                <path d="M 95,15 Q 100,3 110,4 Q 107,12 95,15" />
                <path d="M 125,15 Q 130,27 140,26 Q 137,18 125,15" />
            </g>
            </svg>
        </div>
        </div>
    );
};
const LotusHighlights = () => {
    // Data perfectly ordered with angles to create the circular layout
    const highlightItems = [
        { angle: 270, title: "New Rath for the Lord", img: "/images/rathyatra/Highlights/new-rath.png", customClass: "leaf-rath" },
        { angle: 315, title: "10,000 Pulihora & Halwa Cups", img: "/images/rathyatra/Highlights/pulihora-halwa.png", customClass: "leaf-pulihora" },
        { angle: 0,   title: "Beautiful Rangoli along the Path", img: "/images/rathyatra/Highlights/rangoli.png", customClass: "leaf-rangoli" },
        { angle: 45,  title: "10,000+ Sweets Packets", img: "/images/rathyatra/Highlights/sweets.png", customClass: "leaf-sweets" },
        { angle: 90,  title: "Chappan Bhog Offering", img: "/images/rathyatra/Highlights/chappan-bhog.png", customClass: "leaf-bhog" },
        { angle: 135, title: "Cultural Activities", img: "/images/rathyatra/Highlights/cultural-activities.png", customClass: "leaf-cultural" },
        { angle: 180, title: "10 km Grand Procession", img: "/images/rathyatra/Highlights/grand-procession.png", customClass: "leaf-procession" },
        { angle: 225, title: "Annadanam for 5000 people", img: "/images/rathyatra/Highlights/annadanam.png", customClass: "leaf-annadanam" }
    ];

    return (
        <section className="lotus-section" id="highlights-section">
            <div className="lotus-wrapper">
                
                {/* =========================================
                    BACKGROUND LOTUS PETALS 
                ========================================= */}
                <div className="lotus-petals-bg">
                    {/* The 8 standard petals */}
                    {highlightItems.map((item, index) => (
                        <div 
                            key={`petal-bg-${index}`} 
                            className="bg-petal-shape" 
                            style={{ transform: `rotate(${item.angle + 90}deg)` }}
                        >
                            <svg viewBox="0 0 200 300" className="petal-svg">
                                {/* Solid White Petal with Gold Outline */}
                                <path 
                                    d="M 100 300 C 40 280, 0 200, 0 130 C 0 80, 60 40, 100 0 " 
                                    fill="#ffffff" stroke="#d4a054" strokeWidth="2.5" 
                                />
                                <path 
                                    d="M 100 292 C 45 272, 8 197, 8 130 C 8 84, 64 45, 100 8 " 
                                    fill="none" stroke="#d83a56" strokeWidth="2.5" strokeDasharray="5 7" strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        
                    ))}
                    {highlightItems.map((item, index) => (
                        <div 
                            key={`petal-bg-${index}`} 
                            className="bg-petal-shape-1" 
                            style={{ transform: `rotate(${item.angle + 90}deg)` }}
                        >
                            <svg viewBox="0 0 200 300" className="petal-svg-1">
                                {/* Solid White Petal with Gold Outline */}
                                
                                <path 
                                    d="M 100 300 C 40 280, 0 200, 0 130 C 0 80, 60 40, 100 0 C 140 40, 200 80, 200 130 C 200 200, 160 280, 100 300 Z" 
                                    fill="#ffffff" stroke="#d4a054" strokeWidth="2.5" 
                                />
                                <path 
                                    d="M 100 292 C 45 272, 8 197, 8 130 C 8 84, 64 45, 100 8 C 136 45, 192 84, 192 130 C 192 197, 155 272, 100 292 Z" 
                                    fill="none" stroke="#d83a56" strokeWidth="2.5" strokeDasharray="5 7" strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        
                    ))}
                </div>

                {/* --- THE CENTER BADGE --- */}
                <div className="lotus-center-badge">
                    <div className="lotus-badge-inner">
                        <div className="lotus-badge-border">
                            <h2>Rath Yatra<br/>Highlights</h2>
                        </div>
                    </div>
                </div>

                {/* --- THE CIRCULAR ORBITING ITEMS --- */}
                {highlightItems.map((item, index) => (
                    <div 
                        key={index} 
                        // MAGIC: This injects the specific class name (e.g., 'leaf-rath') into the HTML!
                        className={`lotus-petal-content ${item.customClass}`} 
                        style={{ 
                            '--angle': `${item.angle}deg`,
                            zIndex: index % 2 === 0 ? 6 : 5
                        }}
                    >
                        <div className="petal-icon-ring">
                            <img src={item.img} alt={item.title} className="petal-img" />
                        </div>
                        <p className="petal-title">{item.title}</p>
                    </div>
                ))}

            </div>
        </section>
    );
    
};

const FestivalInfo = () => {
    // Data for the Schedule Timeline
    const scheduleData = [
        { time: "1:00 PM", event: "Guest Speeches @ Public Garden, Jagannath Arati", icon: "🎤" },
        { time: "2:00 PM", event: "Rath Yatra Starts", icon: "🚩" },
        { time: "6:00 PM", event: "Rath reaches Venkateshwara Garden Folloed by Kirtans, Guest Speeches, Cultural Activities, Maha-Arati, Prasadam for All", icon: "🏛️" }
    ];

    // Data for the Budget Snapshot
    const budgetData = [
        { title: "New Rath Construction", amount: "₹14 Lakhs", img: "/images/rathyatra/Highlights/new-rath.png" },
        { title: "Annadanam", amount: "₹5 Lakhs", img: "/images/rathyatra/Highlights/annadanam.png" },
        { title: "Prasadam Distribution", amount: "₹1.5 Lakh", img: "/images/rathyatra/Highlights/sweets.png" },
        { title: "Decorations", amount: "₹1 Lakh", img: "/images/rathyatra/Highlights/decotation.jpg" },
        { title: "Other Arrangements", amount: "₹2 Lakh", img: "/images/rathyatra/Highlights/misslenious.png" }
    ];

    return (
        <section className="festival-info-section">
            
            {/* ROW 1: SCHEDULE & BUDGET (Perfectly Balanced Now) */}
            <div className="festival-info-row">
                {/* --- LEFT COLUMN: THE SCHEDULE --- */}
                <div className="info-column" id="info-section">
                    <div className="info-box">
                        <div className="info-badge">
                            <h2>Rath Yatra Schedule</h2>
                        </div>
                        
                        <div className="timeline-container">
                            {scheduleData.map((item, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-time">{item.time}</div>
                                    <div className="timeline-divider">
                                        <div className="timeline-dot">{item.icon}</div>
                                    </div>
                                    <div className="timeline-content">{item.event}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: THE BUDGET SNAPSHOT --- */}
                <div className="info-column" id="budget-section">
                    <div className="info-box">
                        <div className="info-badge">
                            <h2>Festival Budget Snapshot</h2>
                        </div>
                        
                        <div className="budget-grid">
                            {budgetData.map((item, index) => (
                                <div key={index} className="budget-card">
                                    <div className="budget-icon-wrapper">
                                        <img src={item.img} alt={item.title} className="budget-icon" />
                                    </div>
                                    <p className="budget-title">{item.title}</p>
                                    <div className="budget-price-tag">{item.amount}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: FULL-WIDTH ROUTE MAP */}
            <div className="festival-info-row" style={{ marginTop: '50px' }}>
                <div className="info-column">
                    <div className="info-box">
                        <div className="info-badge">
                            <h2>Rath Route Map</h2>
                        </div>
                        
                        <div className="route-map-content">
                            <div className="route-flow">
                                {['Public Gardens', 'Hanmakonda Chowrasta', 'MGM Hospital', 'Pocham Maidan', 'MGM Hospital', 'Venkateshwara Gardens'].map((stop, idx) => (
                                    <div key={idx} className={`route-stop stop-${idx + 1}`}>
                                        <div className="route-circle"><span>{stop}</span></div>
                                        
                                        {/* Desktop Horizontal Arrow */}
                                        {idx < 5 && <div className="arrow-desktop">➔</div>}

                                        {/* Mobile U-Shape Arrows */}
                                        {idx === 0 && <div className="arrow-mobile arrow-down">⬇</div>}
                                        {idx === 1 && <div className="arrow-mobile arrow-down">⬇</div>}
                                        {idx === 2 && <div className="arrow-mobile arrow-right">➔</div>}
                                        {idx === 3 && <div className="arrow-mobile arrow-up">⬆</div>}
                                        {idx === 4 && <div className="arrow-mobile arrow-up">⬆</div>}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="route-footer-custom">
                                <div className="route-decoration-wavy">
                                    
                                    {/* Left Pin */}
                                    <svg viewBox="0 0 24 35" className="custom-pin">
                                        <path d="M12 2 C6 2 2 6 2 12 C2 19 12 28 12 28 C12 28 22 19 22 12 C22 6 18 2 12 2 Z" />
                                        <circle cx="12" cy="11" r="3.5" fill="#feebe8" />
                                        <ellipse cx="12" cy="32" rx="10" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>

                                    {/* Left Wavy Line with Arrow */}
                                    <div className="wavy-line-container">
                                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="wavy-svg">
                                            {/* Cubic bezier curve to create the wave */}
                                            <path d="M 0 10 C 30 25, 70 -5, 95 10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
                                            {/* Arrow Head */}
                                            <polygon points="95,5 100,10 95,15" fill="currentColor" />
                                        </svg>
                                    </div>

                                    <img src="/images/rathyatra/Highlights/rath-icon.png" alt="Rath" className="route-rath-icon" />

                                    {/* Right Wavy Line with Arrow */}
                                    <div className="wavy-line-container">
                                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="wavy-svg">
                                            {/* Arrow Head */}
                                            <polygon points="5,5 0,10 5,15" fill="currentColor" />
                                            {/* Cubic bezier curve to create the mirrored wave */}
                                            <path d="M 5 10 C 30 -5, 70 25, 100 10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
                                        </svg>
                                    </div>

                                    {/* Right Pin */}
                                    <svg viewBox="0 0 24 35" className="custom-pin">
                                        <path d="M12 2 C6 2 2 6 2 12 C2 19 12 28 12 28 C12 28 22 19 22 12 C22 6 18 2 12 2 Z" />
                                        <circle cx="12" cy="11" r="3.5" fill="#feebe8" />
                                        <ellipse cx="12" cy="32" rx="10" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>

                                </div>
                                <p className="route-blessing-text">
                                    Come, Pull the Rath & be blessed with<br/>Lord {"Jagannath's"} infinite mercy {"!!!"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

// ==========================================
// 1.5 EXTRACTED SEVA CARD COMPONENT
// ==========================================
const SevaCard = ({ plan, onDonate, cardType, gifts, isPremium,initiallyExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

    // Toggle expansion only on mobile
    const handleExpandToggle = () => {
        if (window.innerWidth <= 600) {
            setIsExpanded(!isExpanded);
        }
    };

    const imageClass = cardType === 'maha' ? 'seva-main-img-maha' : 'seva-main-img';
    const premiumClass = isPremium ? 'premium-gold-card' : '';

    return (
        <div className={`seva-card ${premiumClass} ${isExpanded ? 'expanded' : ''}`}>
            
            {/* =========================================
                MOBILE ONLY: COLLAPSED VIEW 
            ========================================= */}
            <div className="mobile-collapsed-header" onClick={handleExpandToggle}>
                <div className="m-row-1">
                    <h4 className="m-title">{plan.title}</h4>
                    <span className="m-arrow shaking">❯</span>
                </div>
                
                <div className="m-row-2">
                    <div className="m-gift-sec" onClick={(e) => e.stopPropagation()}>
                        <span className="m-gift-text">Donor will get ➔</span>
                        <GiftBox gifts={gifts} plan={plan} onDonate={onDonate} />
                    </div>
                    <button className="m-donate-btn" onClick={() =>onDonate(plan.price, plan.title)}>
                        Donate ₹{plan.price.toLocaleString()}/-
                    </button>
                </div>
            </div>

            {/* =========================================
                DESKTOP VIEW / MOBILE EXPANDED VIEW
            ========================================= */}
            <div className="seva-card-expanded-content">
                <div className="seva-image-container">
                    <img src={plan.icon} alt={plan.title} className={imageClass} />
                </div>

                <div className={`seva-content ${cardType}`}>
                    <div className="title-badge">
                        <span className="gold-star">✦</span>
                        <h3>{plan.title}</h3>
                        <span className="gold-star">✦</span>
                    </div>

                    <div className="side-by-side-container">
                        <span>Donor will get ➔</span>
                        <GiftBox gifts={gifts} plan={plan} onDonate={onDonate} />
                    </div>
                    
                    <button onClick={() =>onDonate(plan.price, plan.title)} className="contribute-btn">
                        <span className="gold-star">✦</span>
                        Donate {plan.price.toLocaleString()}/-
                        <span className="gold-star">✦</span>
                    </button>
                </div>
                {/* Specific button to close the card safely */}
                <div className="mobile-collapse-btn" onClick={handleExpandToggle}>
                    ⌃ Tap here to collapse ⌃
                </div>
            </div>

        </div>
    );
};

// 3. MAIN RATHYATRA COMPONENT
export default function Rathyatra() {
    const router = useRouter();
    const { handleDonateClick } = useDonate();
    const [navOpen, setNavOpen] = useState(false)
    const [earnedGifts, setEarnedGifts] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false); // Optional: to show a loading spinner if DB is slow
    
    const [amount, setAmount] = useState();
    
    const donationRef = useRef(null);
    const scrollToDonation = () => {
        donationRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Data Objects
    const sevaCategories = {
        maha: [
            { title: "Rath Yatra MAHASEVAK", price: 108000, icon: "/images/rathyatra/jagannath-rath.jpeg" },
            { title: "Rath Yatra SEVAK", price: 51000, icon: "/images/rathyatra/jagannath-rath-2.jpeg" }
        ],
        pradhana: [
            { title: "JAGANNATH SEVA", price: 25116, icon: "/images/rathyatra/Jagannath.png" },
            { title: "BALADEVA SEVA", price: 15116, icon: "/images/rathyatra/Baladev.png" },
            { title: "SUBHADRA SEVA", price: 10116, icon: "/images/rathyatra/Subhadra.png" }
        ],
        visesa: [
            { title: "SUDARSHAN SEVA", price: 5116, icon: "/images/rathyatra/Sudarshan.jpg" },
            { title: "SANKIRTAN SEVA", price: 2116, icon: "/images/rathyatra/sankirtana.jpg" }
        ],
        bhakta: [
            { title: "GARUDA SEVA", price: 1116, icon: "/images/rathyatra/Garuda.jpg" },
            { title: "HANUMAN SEVA", price: 516, icon: "/images/rathyatra/hanumana.jpg" }
        ]
    };

    const Gifts = {
        maha: [
            {title: "Srila Prabhupada Coin", img: "/images/rathyatra/Gifts/srila-prabhupada-coin.jpeg"}, 
            {title: "Jagannath Puri Temple Flag", img: "/images/rathyatra/Gifts/jagannath-puri-flag.jpg"}, 
            {title: "Jagannath Locket", img: "/images/rathyatra/Gifts/jagannath-locket.jpeg"},
            {title: "Jagannath Keychain", img: "/images/rathyatra/Gifts/jagannath-keychain.jpeg"}, 
            {title: "Acrylic Photo Stand", img: "/images/rathyatra/Gifts/acrylic-photo-stand.jpeg"}, 
            {title: "Glass Jagannath Showpiece", img: "/images/rathyatra/Gifts/glass-jagannath-showpiece.jpeg"},  
            {title: "Small Jagannath Deities", img: "/images/rathyatra/Gifts/small-jagannath-deities.jpg"},
            {title: "Jagannath Agarbatti", img: "/images/rathyatra/Gifts/jagannath-agarbatti.jpg"}, 
            {title: "Mahaprasadam Box", img: "/images/rathyatra/Gifts/mahaprasadam-box.webp"}, 
            {title: "Mahaprasadam Packet", img: "/images/rathyatra/Gifts/mahaprasadam-packet.jpeg"}, 
        ],
        maha_1: [
            {title: "Srila Prabhupada Coin", img: "/images/rathyatra/Gifts/srila-prabhupada-coin.jpeg"}, 
            {title: "Jagannath Puri Temple Flag", img: "/images/rathyatra/Gifts/jagannath-puri-flag.jpg"}, 
            {title: "Jagannath Locket", img: "/images/rathyatra/Gifts/jagannath-locket.jpeg"},
            {title: "Acrylic Photo Stand", img: "/images/rathyatra/Gifts/acrylic-photo-stand.jpeg"},
            {title: "Glass Jagannath Showpiece", img: "/images/rathyatra/Gifts/glass-jagannath-showpiece.jpeg"}, 
            {title: "Mahaprasadam Box", img: "/images/rathyatra/Gifts/mahaprasadam-box.webp"}, 
        ],
        maha_2: [
            {title: "Jagannath Puri Temple Flag", img: "/images/rathyatra/Gifts/jagannath-puri-flag.jpg"}, 
            {title: "Jagannath Locket", img: "/images/rathyatra/Gifts/jagannath-locket.jpeg"},
            {title: "Acrylic Photo Stand", img: "/images/rathyatra/Gifts/acrylic-photo-stand.jpeg"},
            {title: "Glass Jagannath Showpiece", img: "/images/rathyatra/Gifts/glass-jagannath-showpiece.jpeg"}, 
            {title: "Mahaprasadam Box", img: "/images/rathyatra/Gifts/mahaprasadam-box.webp"}, 
        ],
        pradhana: [
            {title: "Jagannath Puri Temple Flag", img: "/images/rathyatra/Gifts/jagannath-puri-flag.jpg"}, 
            {title: "Jagannath Keychain", img: "/images/rathyatra/Gifts/jagannath-keychain.jpeg"}, 
            {title: "Acrylic Photo Stand", img: "/images/rathyatra/Gifts/acrylic-photo-stand.jpeg"},
            {title: "Jagannath Agarbatti", img: "/images/rathyatra/Gifts/jagannath-agarbatti.jpg"}, 
            {title: "Mahaprasadam Box", img: "/images/rathyatra/Gifts/mahaprasadam-box.webp"}, 
        ],
        visesa: [
            {title: "Jagannath Keychain", img: "/images/rathyatra/Gifts/jagannath-keychain.jpeg"}, 
            {title: "Acrylic Photo Stand", img: "/images/rathyatra/Gifts/acrylic-photo-stand.jpeg"},
            {title: "Jagannath Agarbatti", img: "/images/rathyatra/Gifts/jagannath-agarbatti.jpg"}, 
            {title: "Mahaprasadam Box", img: "/images/rathyatra/Gifts/mahaprasadam-box.webp"}, 
        ],
        bhakta: [
            {title: "Jagannath Keychain", img: "/images/rathyatra/Gifts/jagannath-keychain.jpeg"}, 
            {title: "Mahaprasadam Packet", img: "/images/rathyatra/Gifts/mahaprasadam-packet.jpeg"}, 
        ]
    };
    const SevaNameToPlanKey = {
        "Rath Yatra MAHASEVAK": "maha_1",
        "Rath Yatra SEVAK": "maha_2",
        "JAGANNATH SEVA": "pradhana",
        "BALADEVA SEVA": "pradhana",
        "SUBHADRA SEVA": "pradhana",
        "SUDARSHAN SEVA": "visesa",
        "SANKIRTAN SEVA": "visesa",
        "GARUDA SEVA": "bhakta",
        "HANUMAN SEVA": "bhakta"
    }

    const searchParams = useSearchParams();
    useEffect(() => {
        const checkDonation = async () => {
            const orderId = searchParams.get('order_id');
            // 2. Call your backend API to get the order details from the database
            const response = await fetch(`/api/donationdata?order_id=${orderId}`);
            const donation = await response.json();

            // 1. If it's a successful payment with an order ID, check the DB!
            if (donation.status === 'SUCCESS' && orderId) {
                setIsVerifying(true);

                try {

                    const dbSevaName = donation.seva_name;

                    if (dbSevaName == 'Rath Yatra') {
                        const donationamount = donation.amount;
                        if(donationamount >= 108000){
                            setEarnedGifts(Gifts.maha_1);
                        }
                        else if(donationamount >= 51000){
                            setEarnedGifts(Gifts.maha_2);
                        }
                        else if(donationamount >= 10116){
                            setEarnedGifts(Gifts.pradhana);
                        }
                        else if(donationamount >= 2116){
                            setEarnedGifts(Gifts.visesa);
                        }
                        else if(donationamount >= 516){
                            setEarnedGifts(Gifts.bhakta);
                        }
                        else{
                            console.log("till here")
                            setEarnedGifts([]);
                        }
                    }
                    // const dbSevaName="kjsdnfk"

                    // 3. MAGIC CHECK: Pass the DB name into our translation map
                    else{
                        console.log("herehere")
                        const matchedPlanKey = SevaNameToPlanKey[dbSevaName];
                        if (matchedPlanKey) {
                            setEarnedGifts(Gifts[matchedPlanKey]);
                        }
                        else{
                            setEarnedGifts([]);
                        }
                    }
                } catch (error) {
                    console.error("Failed to verify donation:", error);
                } finally {
                    setIsVerifying(false);
                }
            }
        };

        checkDonation();
    }, [searchParams]);

    const handleCloseSuccessModal = () => {
        setEarnedGifts(null);
        
        // Clean up the URL so the popup doesn't appear again if they refresh the page
        // (Removes ?status=success&order_id=... from the address bar)
        router.replace(window.location.pathname, { scroll: false });
    };

    return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            
            {/* Optional: Show a tiny verifying message while waiting for the DB */}
            {isVerifying && (
                <div className="verifying-payment">
                    Verifying your payment... ⏳
                </div>
            )}

            <div className="hero-page-container">
                {/* THE NEW PICTURE ELEMENT FOR ART DIRECTION */}
                <picture>
                    {/* 1. Mobile Image: Only loads if the screen is 768px or smaller */}
                    <source 
                        media="(max-width: 768px)" 
                        srcSet="/images/rathyatra/hero-image-mobile.png" 
                    />
                    
                    {/* 2. Desktop Image: The default fallback that loads on larger screens */}
                    <img 
                        src="/images/rathyatra/hero-image-new.png" 
                        alt="Rath Yatra Festive Backdrop" 
                        className="hero-underlay-image" 
                    />
                </picture>

                {/* =========================================
                    NEW: DESKTOP ONLY GRAND INVITATION BADGE
                ========================================= */}
                {/* =========================================
                    DESKTOP ONLY GRAND INVITATION BADGE
                ========================================= */}
                <div className="desktop-hero-info">
                    
                    {/* NEW: THE GRAND ARRIVAL TEXT */}
                    <div className="grand-arrival-text">
                        <span className="text-he-is">He is</span>
                        <span className="text-coming">COMING</span>
                    </div>

                    <h4 className="info-subtitle">Join the Grand Procession</h4>
                    
                    <div className="info-date-wrapper">
                        <span className="info-day">20</span>
                        <div className="info-month-year">
                            <span className="info-month">JULY</span>
                            <span className="info-year">Monday</span>
                        </div>
                    </div>
                    
                    <p className="info-location">
                        📍 Starts @ Public Gardens
                    </p>
                </div>
                {/* =========================================
                    NEW: MOBILE-ONLY FLOATING DATE BADGE
                ========================================= */}
                {/* NEW: Button Container */}
                <div className="hero-button-group">
                    <div className="hero-group-header">
                        <h3 className="hero-group-title">Quick Links</h3>
                        <div className="mobile-hero-date">
                            <span className="date-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                    {/* Optional: Adds a little dot for the 20th! */}
                                    <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"></circle>
                                </svg>
                            </span>
                            <div className="date-text">
                                <span className="date-day">20</span>
                                <div className="date-month-year">
                                    <span className="date-month">JULY</span>
                                    <span className="date-details">Monday</span> {/* Update day if needed! */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="hero-btn" onClick={scrollToDonation}>
                        Donation Options
                    </button>
                    <a href="#highlights-section" className="hero-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                        Rath Yatra Highlights
                    </a>
                    <a href="#budget-section" className="hero-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                        Rath Yatra Budget
                    </a>
                    <a href="#info-section" className="hero-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                        Rath Yatra Schedule
                    </a>
                </div>
            </div>
            
            <div className="middle-part-container" ref={donationRef}>
                <LeafyDivider text="MAHA SEVA" />
                <section className="seva-grid-maha">
                    {sevaCategories.maha.map((plan, index) => (
                        <SevaCard key={index} plan={plan} onDonate={handleDonateClick} cardType="maha" gifts={Gifts[`maha_${index + 1}`]} isPremium={index === 0} /* MAGIC: Only the first card (index 0) gets told to start open! */
                            initiallyExpanded={index === 0}/>
                    ))}
                </section>
                
                <LeafyDivider text="PRADHANA SEVA" />
                <section className="seva-grid-pradhana">
                    {sevaCategories.pradhana.map((plan, index) => (
                        <SevaCard key={index} plan={plan} onDonate={handleDonateClick} cardType="pradhana" gifts={Gifts.pradhana} />
                    ))}
                </section>

                <div className="bottom-seva-row">
                    {/* VISESA SEVA */}
                    <div className="seva-column">
                        <LeafyDivider text="VISESA SEVA" svgWidth="100px" />
                        <section className="seva-grid-half">
                            {sevaCategories.visesa.map((plan, index) => (
                                <SevaCard key={index} plan={plan} onDonate={handleDonateClick} cardType="visesa" gifts={Gifts.visesa} />
                            ))}
                        </section>
                    </div>

                    {/* BHAKTA SEVA */}
                    <div className="seva-column">
                        <LeafyDivider text="BHAKTA SEVA" svgWidth="100px" />
                        <section className="seva-grid-half">
                            {sevaCategories.bhakta.map((plan, index) => (
                                <SevaCard key={index} plan={plan} onDonate={handleDonateClick} cardType="bhakta" gifts={Gifts.bhakta} />
                            ))}
                        </section>
                    </div>
                </div>
            </div>
            <LeafyDivider text="Custom Donation" svgWidth="100px" />
            <div className='custom-donation'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDonateClick(amount, "Rath Yatra");
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
            {/* <Highlights /> */}
            <LotusHighlights />
            <FestivalInfo />
            
            
            {/* 5. Render the success modal ONLY if the DB confirmed it and set the gifts */}
            {earnedGifts && (
                <DonationSuccessModal 
                    gifts={earnedGifts} 
                    onClose={handleCloseSuccessModal} 
                />
            )}

            <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
                <DirectDonation />
            </div>
            <Floating />
            <Foooter />
        </>
    );
}