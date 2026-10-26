"use client";
import React, { useState, useEffect, useRef } from 'react';
import './kartik.css';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import { useDonateTest } from "@/Helpers/PaymentPageHandler-copy";
import { 
  Flame, Heart, Sparkles, Gift, ShieldCheck, Share2, Download, 
  CheckCircle, Volume2, VolumeX, ShoppingBag, ArrowRight, X, QrCode, 
  CreditCard, Building, Sun, Check, Copy, Flower2, Utensils
} from 'lucide-react';

// Predefined Seva Data Tiers
const LAMP_TIERS = [
  { id: 1, lamps: 50, price: 250, desc: '50 Deep Daan Lamps in Vrindavan Dham' },
  { id: 2, lamps: 100, price: 500, desc: '100 Deep Daan Lamps for Lord Damodara' },
  { id: 3, lamps: 250, price: 1250, desc: '250 Deep Daan Lamps with Special Archana' },
  { id: 4, lamps: 500, price: 2500, desc: '500 Deep Daan Lamps - Family Sankalpa' },
  { id: 5, lamps: 1000, price: 5000, desc: '1000 Maha Deep Daan Lamps Illumination' },
];

const ANNA_DAAN_TIERS = [
  { id: 1, title: 'Devotee Feast Seva', price: 1100, desc: 'Sponsor Mahaprasadam feast for 25 Vaishnavas' },
  { id: 2, title: 'Damodar Bhog Seva', price: 2500, desc: 'Special 56 Bhog Offering to Sri Sri Radha Damodara' },
  { id: 3, title: 'Braj Vasi Feeding', price: 5000, desc: 'Feed 100 Brajvasis and Sadhus during Kartik' },
];

const GO_SEVA_TIERS = [
  { id: 1, title: 'Cow Grass & Feed', price: 501, desc: 'Provide fresh green fodder for 5 Gaumatas' },
  { id: 2, title: 'Gau Medical Care', price: 1500, desc: 'Sponsor medical checkup & medicines for sick cows' },
  { id: 3, title: 'Nandi Care Seva', price: 3000, desc: 'Monthly care and feeding of retired bulls' },
];

const TULASI_DECOR_TIERS = [
  { id: 1, title: 'Tulasi Archana & Puja', price: 351, desc: 'Daily Tulasi Maharani Puja & Water offering' },
  { id: 2, title: 'Altar Floral Garland', price: 2100, desc: 'Fragrant flower garlands for Sri Sri Radha Damodar' },
  { id: 3, title: 'Grand Temple Flower Decor', price: 10008, desc: 'Full altar decoration for Special Kartik Ekadashi' },
];

// Sample Initial Prayers for Virtual Wall
const INITIAL_PRAYERS = [
  { id: 1, name: 'Radhika Devi Dasi', city: 'Mumbai', prayer: 'May Lord Damodara bless our family with Pure Devotional Service.' },
  { id: 2, name: 'Rameshwar Das', city: 'Bengaluru', prayer: 'Praying for good health and Krishna Consciousness for all living beings.' },
  { id: 3, name: 'Ananya Sharma', city: 'Delhi', prayer: 'Seeking blessings for my parents and spiritual progress this Kartik.' },
];

export default function App() {
  // Navigation & Category States
  const [navOpen, setNavOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('lamps');
  const [customAmount, setCustomAmount] = useState('');
//   const [cart, setCart] = useState([]);
//   const [isCartOpen, setIsCartOpen] = useState(false);
const { handleDonateClick } = useDonateTest();
  
  // Selected Seva State for Modal
  const [selectedSeva, setSelectedSeva] = useState(null);
  
  // Form State
  const [sankalpaForm, setSankalpaForm] = useState({
    name: '',
    phone: '',
    city: '',
    gotra: '',
    nakshatra: '',
    dedication: ''
  });
  
  // Payment Step State (1: Sankalpa, 2: Payment/QR, 3: Certificate)
  const [modalStep, setModalStep] = useState(1);
  const [prayersList, setPrayersList] = useState(INITIAL_PRAYERS);
  
  // Virtual Diya Form State
  const [virtualDiya, setVirtualDiya] = useState({ name: '', city: '', prayer: '' });

  // Audio Chant State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Background Audio Toggle Logic
  const toggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
    }
  };

  const handleOpenSevaModal = (sevaTitle, amount) => {
    setSelectedSeva({ title: sevaTitle, amount: amount });
    setModalStep(1);
  };

  const handleFormChange = (e) => {
    setSankalpaForm({ ...sankalpaForm, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!sankalpaForm.name || !sankalpaForm.phone) {
      alert('Please fill in your name and phone number.');
      return;
    }
    setModalStep(2);
  };

  const handleSimulateSuccess = () => {
    setModalStep(3);
    // Add to prayer wall if prayer entered
    if (sankalpaForm.dedication) {
      setPrayersList([
        {
          id: Date.now(),
          name: sankalpaForm.name,
          city: sankalpaForm.city || 'Devotee',
          prayer: sankalpaForm.dedication
        },
        ...prayersList
      ]);
    }
  };

  const handleAddVirtualDiya = (e) => {
    e.preventDefault();
    if (!virtualDiya.name || !virtualDiya.prayer) return;
    setPrayersList([
      {
        id: Date.now(),
        name: virtualDiya.name,
        city: virtualDiya.city || 'Dham Devotee',
        prayer: virtualDiya.prayer
      },
      ...prayersList
    ]);
    setVirtualDiya({ name: '', city: '', prayer: '' });
  };

  // Cart Functions
//   const addToCart = (sevaItem, categoryName) => {
//     const existingIndex = cart.findIndex(item => item.id === sevaItem.id);
//     if (existingIndex > -1) {
//       const updated = [...cart];
//       updated[existingIndex].qty += 1;
//       setCart(updated);
//     } else {
//       setCart([...cart, { ...sevaItem, categoryName, qty: 1 }]);
//     }
//     setIsCartOpen(true);
//   };

//   const addCustomLampSeva = () => {
//     const count = parseInt(customLamps);
//     if (!count || count <= 0) return;
//     const amount = count * 5; // Rs 5 per lamp rate
//     const customItem = {
//       id: 'custom_' + Date.now(),
//       title: `${count} Custom Ghee Lamps`,
//       amount: amount,
//       lamps: count,
//       qty: 1,
//       categoryName: 'Lamp Seva'
//     };
//     setCart([...cart, customItem]);
//     setCustomLamps('');
//     setIsCartOpen(true);
//   };

//   const removeFromCart = (id) => {
//     setCart(cart.filter(item => item.id !== id));
//   };

//   const updateQty = (id, delta) => {
//     setCart(cart.map(item => {
//       if (item.id === id) {
//         const newQty = item.qty + delta;
//         return newQty > 0 ? { ...item, qty: newQty } : item;
//       }
//       return item;
//     }));
//   };

//   const totalCartAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <>
        <Header handleNav={() => setNavOpen(!navOpen)} />
        <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            {/* 1. FIXED BACKGROUND IMAGE CONTAINER (Yasoda Damodara Artwork) */}
        <div 
            className="fixed inset-0 z-0 bg-cover bg-top bg-no-repeat bg-fixed filter brightness-90 contrast-[1.1] pt-20"
            style={{ 
            backgroundImage: `url('https://i.pinimg.com/originals/0a/b0/17/0ab017a6bc08c8776b1e89b248d524c7.jpg')`,
            // Fallback image if direct host requires alternative
            //   backgroundFallback: `url('/p')`
            }}
        >
            {/* Deep Crimson/Maroon & Golden Gradient Overlay for High Content Contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-red-950/45 to-black/50 backdrop-brightness-75"></div>

            {/* Ambient Glowing Floating Sparks Overlay */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:28px_28px]"></div>
        </div>
        <div className="app-viewport">
        {/* Background Audio Dynamic Audio Element */}
        {isPlayingAudio && (
            <iframe
            src="https://www.youtube.com/embed/3E9fK6E0sVE?autoplay=1&loop=1"
            title="Damodarashtakam Background Chant"
            allow="autoplay"
            style={{ zIndex: 10 }}
            ></iframe>
        )}

        {/* Background Glowing Sparkle Particles */}
        <div className="particles-layer">
            {[...Array(12)].map((_, i) => (
            <div
                key={i}
                className="particle-spark"
                style={{
                left: `${(i * 8.3) + 2}%`,
                animationDelay: `${i * 0.7}s`
                }}
            />
            ))}
        </div>

        <div className="container-main">
            {/* Header / Poster Banner Banner Section */}
            <header className="hero-header">
            <h1 className="hero-title gold-gradient-text">KARTIK MONTH SEVA</h1>
            <p className="hero-subtitle">Offer the Light of Devotion to Sri Sri Radha Damodara</p>

            <div className="date-badge">
                {/* <span>🪔</span> */}
                <span>26 OCTOBER – 24 NOVEMBER</span>
                {/* <span>🪔</span> */}
            </div>

            <div className="sloka-card gold-card-frame">
                <p className="sloka-text">
                "namāmīśvaraṁ sac-cid-ānanda-rūpaṁ"
                </p>
                <p className="sloka-meaning">
                To the Supreme Lord whose form is eternal existence, knowledge, and bliss, I offer my humble obeisances.
                </p>
            </div>
            </header>

            {/* Navigation Category Tabs */}
            <nav className="navigation-tabs">
            <button
                className={`tab-btn ${activeTab === 'lamps' ? 'active' : ''}`}
                onClick={() => setActiveTab('lamps')}
            >
                🪔 Lamp Seva
            </button>
            {/* <button
                className={`tab-btn ${activeTab === 'anna' ? 'active' : ''}`}
                onClick={() => setActiveTab('anna')}
            >
                🍲 Anna Daan
            </button>
            <button
                className={`tab-btn ${activeTab === 'go' ? 'active' : ''}`}
                onClick={() => setActiveTab('go')}
            >
                🐄 Go Seva
            </button>
            <button
                className={`tab-btn ${activeTab === 'tulasi' ? 'active' : ''}`}
                onClick={() => setActiveTab('tulasi')}
            >
                🌿 Tulasi & Decor
            </button> */}
            </nav>

            {/* Seva Options Grid Display */}
            {activeTab === 'lamps' && (
            <div className="seva-grid">
                {LAMP_TIERS.map((tier, idx) => (
                <div key={idx} className="gold-card-frame seva-card">
                    <div className="seva-card-header">
                    <h3 className="seva-title">{tier.lamps} Lamps</h3>
                    <span className="seva-price">₹{tier.price}</span>
                    </div>
                    {/* <p className="seva-description">{tier.desc}</p> */}
                    <button
                    className="btn-gold-action"
                    onClick={() =>handleDonateClick(tier.price, `Kartik - ${tier.lamps} Lamp Seva`, "Kartik Seva")}
                    >
                    Offer {tier.lamps} Lamps
                    </button>
                </div>
                ))}

                {/* Custom Amount Card */}
                <div className="gold-card-frame seva-card">
                <div className="seva-card-header">
                    <h3 className="seva-title">Custom Seva</h3>
                    <span className="seva-price">Any Amount</span>
                </div>
                <p className="seva-description">Offer any number of lamps or custom amount for Kartik Month Seva.</p>
                <div className="custom-amount-box">
                    <input
                    type="number"
                    placeholder="Enter Amount in ₹"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="custom-input"
                    />
                    <button
                    className="btn-gold-action"
                    onClick={() => customAmount && handleDonateClick(Number(customAmount), 'Kartik Lamp Seva', 'Kartik Seva')}
                    >
                    Offer Custom Seva
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* Anna Daan Section */}
            {/* {activeTab === 'anna' && (
            <div className="seva-grid">
                {ANNA_DAAN_TIERS.map((tier, idx) => (
                <div key={idx} className="gold-card-frame seva-card">
                    <div className="seva-card-header">
                    <h3 className="seva-title">{tier.title}</h3>
                    <span className="seva-price">₹{tier.price}</span>
                    </div>
                    <button
                    className="btn-gold-action"
                    onClick={() => handleDonateClick(tier.price, tier.title, 'Kartik Seva')}
                    >
                    Sponsor Prasad
                    </button>
                </div>
                ))}
            </div>
            )} */}

            {/* Go Seva Section */}
            {/* {activeTab === 'go' && (
            <div className="seva-grid">
                {GO_SEVA_TIERS.map((tier, idx) => (
                <div key={idx} className="gold-card-frame seva-card">
                    <div className="seva-card-header">
                    <h3 className="seva-title">{tier.title}</h3>
                    <span className="seva-price">₹{tier.price}</span>
                    </div>
                    <button
                    className="btn-gold-action"
                    onClick={() => handleDonateClick(tier.price, tier.title, 'Kartik Seva')}
                    >
                    Serve Gaumata
                    </button>
                </div>
                ))}
            </div>
            )} */}

            {/* Tulasi & Decor Section */}
            {/* {activeTab === 'tulasi' && (
            <div className="seva-grid">
                {TULASI_DECOR_TIERS.map((tier, idx) => (
                <div key={idx} className="gold-card-frame seva-card">
                    <div className="seva-card-header">
                    <h3 className="seva-title">{tier.title}</h3>
                    <span className="seva-price">₹{tier.price}</span>
                    </div>
                    <button
                    className="btn-gold-action"
                    onClick={() => handleDonateClick(tier.price, tier.title, 'Kartik Seva')}
                    >
                    Offer Seva
                    </button>
                </div>
                ))}
            </div>
            )} */}

            {/* Interactive Virtual Diya & Prayer Wall */}
            {/* <section className="section-title-wrap">
                <h2 className="section-title gold-gradient-text">Virtual Diya & Prayer Wall</h2>
                <p className="hero-subtitle">Offer a lamp virtually and write your prayers to Lord Damodara</p>
            </section>

            <div className="gold-card-frame virtual-offering-box">
            <h3 style={{ color: 'var(--gold-primary)', marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>
                Light Your Virtual Lamp
            </h3>
            <form onSubmit={handleAddVirtualDiya}>
                <div className="form-group">
                <label className="form-label">Devotee Name</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name"
                    value={virtualDiya.name}
                    onChange={(e) => setVirtualDiya({ ...virtualDiya, name: e.target.value })}
                    required
                />
                </div>
                <div className="form-group">
                <label className="form-label">City / Country</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Vrindavan, India"
                    value={virtualDiya.city}
                    onChange={(e) => setVirtualDiya({ ...virtualDiya, city: e.target.value })}
                />
                </div>
                <div className="form-group">
                <label className="form-label">Your Prayer / Sankalpa</label>
                <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Write your heartfelt prayer to Lord Sri Krishna..."
                    value={virtualDiya.prayer}
                    onChange={(e) => setVirtualDiya({ ...virtualDiya, prayer: e.target.value })}
                    required
                ></textarea>
                </div>
                <button type="submit" className="btn-gold-action pulse-glow">
                🪔 Light Diya & Submit Prayer
                </button>
            </form>
            </div> */}

            {/* Prayers Display Grid */}
            {/* <div className="prayer-wall-grid">
            {prayersList.map((item) => (
                <div key={item.id} className="gold-card-frame diya-card">
                <svg className="diya-flame-icon" viewBox="0 0 24 24">
                    <path d="M12 2C12 2 7 8.5 7 13.5C7 16.5 9.2 19 12 19C14.8 19 17 16.5 17 13.5C17 8.5 12 2 12 2Z" />
                </svg>
                <div className="devotee-name">{item.name}</div>
                <div className="devotee-location">{item.city}</div>
                <p className="devotee-prayer">"{item.prayer}"</p>
                </div>
            ))}
            </div> */}

            {/* Interactive Audio Toggle Controls */}
            {/* <div className="audio-control-bar">
            <button className="btn-audio-toggle" onClick={toggleAudio}>
                <div className="sound-wave">
                <span className={`sound-wave-bar ${isPlayingAudio ? 'playing' : ''}`}></span>
                <span className={`sound-wave-bar ${isPlayingAudio ? 'playing' : ''}`}></span>
                <span className={`sound-wave-bar ${isPlayingAudio ? 'playing' : ''}`}></span>
                </div>
                <span>{isPlayingAudio ? 'Pause Chants' : 'Play Chants 🎵'}</span>
            </button>
            </div> */}
        </div>
        {/* SCAN TO DONATE SECTION (MATCHING BOTTOM OF POSTER WITH QR CODE) */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-8" style={{ background:'none'}}>
        <div className="bg-gradient-to-r from-[#4d0c15] via-[#66121f] to-[#4d0c15] border-4 border-amber-400/80 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(255,215,0,0.3)] text-center flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="text-left space-y-3 max-w-md">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-[11px] font-sans font-bold uppercase tracking-widest">
              Direct UPI Donation
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-100 font-serif">
              SCAN TO DONATE NOW
            </h3>
            <p className="text-xs md:text-sm text-amber-200/90 font-sans">
              Scan using any UPI app (GPay, PhonePe, Paytm, BHIM) to directly contribute to Kartik Seva.
            </p>
            <div className="text-xs text-amber-300 font-mono bg-amber-950/60 p-2 rounded-xl border border-amber-700/60 inline-block">
              UPI ID: <span className="font-bold text-amber-100">donate.iskcon@icici</span>
            </div>
          </div>

          {/* QR CODE CONTAINER (MATCHING POSTER QR DESIGN) */}
          <div className="bg-white p-4 rounded-2xl border-4 border-amber-400 shadow-[0_0_25px_rgba(255,215,0,0.5)] flex flex-col items-center">
            <img src="/donateForIMGs/qrCode.jpg" alt="" />
          </div>

        </div>
      </section>

        {/* Sankalpa & UPI Modal Popup */}
        </div>
        {/* <Foooter /> */}
        <Floating />
        {/* SEVA BASKET DRAWER */}
      {/* {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm pt-[100px]">
          <div className="w-full max-w-md bg-[#2b060a] border-l-2 border-amber-500/60 h-full flex flex-col justify-between p-6 shadow-2xl relative">
            
            <div>
              <div className="flex items-center justify-between border-b border-amber-800/60 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold font-serif text-amber-200">Your Seva Basket</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-full text-amber-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-amber-400/60 text-xs font-sans">
                  <Flame className="w-10 h-10 mx-auto text-amber-600/50" />
                  <p>Your basket is empty. Add a Seva to proceed.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-amber-950/60 border border-amber-800/60 rounded-xl p-3 flex items-center justify-between text-xs font-sans">
                      <div>
                        <div className="text-[10px] text-amber-400 font-semibold">{item.categoryName}</div>
                        <div className="font-bold text-amber-100">{item.title}</div>
                        <div className="text-amber-300 font-mono">Rs. {item.price}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-amber-900/60 rounded-lg border border-amber-700">
                          <button onClick={() => updateQty(item.id, -1)} className="px-2 py-0.5 text-amber-300">-</button>
                          <span className="px-2 font-bold text-amber-100">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="px-2 py-0.5 text-amber-300">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-amber-800/60 pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm font-sans">
                  <span className="text-amber-300">Total Seva Amount:</span>
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    Rs. {totalCartAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep(1);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Proceed for Sankalpa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )} */}
    </>
  );
}