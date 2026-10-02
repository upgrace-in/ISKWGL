"use client"
import { useState, useEffect, useRef } from "react";
import Header from "@/Components/Header";
import Mission from "@/Components/Mission";
import Founder from "@/Components/Founder";
import Foooter from "@/Components/footter";
import Floating from "@/Components/Floating";
import DonateCategories from "@/Components/DonateCategories";
import DirectDonation from "@/Components/DirectDonation";
import NewsArticles from "@/Components/NewsArticles";
import Welcome from "@/Components/Welcome";
import PinSpacer from "@/Components/PinSpacer";
import Gallery from "@/Components/Gallery";
import VideoComponent from "@/Components/VideoComponent";
import Temple from "@/Components/Temple";
import ReactGA from "react-ga4";
import BirthdayHandler from "@/Components/BirthdayHandler"
import "./mainstyle.css"
import { 
  Search, 
  ChevronDown, 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

function Home() {

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Special card slides for the bottom right carousel (changes every 5 seconds)
  const slides = [
    {
      category: "SPECIAL OCCASIONS",
      title: "Make Your Birthday Special with Seva",
      desc: "Celebrate your special day by supporting seva and blessings from Sri Sri Radha Madhava.",
      image: "https://images.unsplash.com/photo-1609342122562-a4fdb1887f17?q=80&w=800&auto=format&fit=crop"
    },
    {
      category: "ANNIVERSARY BLESSINGS",
      title: "Make Your Wedding Anniversary Memorable",
      desc: "Offer your gratitude to the Lord on your anniversary with sacred Annadanam and deity worship.",
      image: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop"
    },
    {
      category: "NITYA SEVA",
      title: "Daily Deity Prasadam & Bhog Seva",
      desc: "Participate in daily offerings to sustain the temple's daily bhoga and cow protection initiatives.",
      image: "https://images.unsplash.com/photo-1607478900766-efe1324881f0?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const sevaCards = [
    {
      id: 'annadaan',
      title: 'Annadaan',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
      desc: "Your open-hearted contribution can bring food to the hungry, hope to the needy, and transform countless lives.",
      amounts: [1500, 3000, 5000, 7500, 10000, 15000, 25000],
      defaultAmount: 1500
    },
    {
      id: 'chaturmasya',
      title: 'Chaturmasya',
      image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop',
      desc: "This Chaturmasya, Please support ISKCON to serve the society through Annadaan, Vidyadaan, etc, and various other activities.",
      amounts: [1500, 3000, 5000, 7500, 10000, 15000, 25000],
      defaultAmount: 1500
    },
    {
      id: 'gitagift',
      title: 'Gift of Gita',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      desc: "Through our Bhagavad Gita Distribution initiative, we bring this sacred scripture to people worldwide.",
      amounts: [1250, 2500, 5000, 7500, 10000, 12500, 20000],
      defaultAmount: 1250
    },
    {
      id: 'birthday',
      title: 'Birthday Annadaan',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
      desc: "Make your birthday truly meaningful. Celebrate by feeding the needy and sharing Krishna's compassion.",
      amounts: [1500, 3000, 5000, 7500, 10000, 15000, 25000],
      defaultAmount: 1500
    }
  ];

  const [selectedAmounts, setSelectedAmounts] = useState({
    annadaan: 1500,
    chaturmasya: 1500,
    gitagift: 1250,
    birthday: 1500
  });

  const [customInputs, setCustomInputs] = useState({
    annadaan: '',
    chaturmasya: '',
    gitagift: '',
    birthday: ''
  });

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const festivals = [
    {
      title: "Sharad Purnima",
      category: "FESTIVALS",
      description: "Sharad Purnima marks the autumn full moon and celebrates Lord Krishna's divine “rasa-lila” with the gopis of Vrindavan, His most beloved dev...",
      date: "26 October 2026",
      image: "https://images.unsplash.com/photo-1609137144813-752467d62cbf?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Kartik - The Holiest Month",
      category: "FESTIVALS",
      description: "The sacred Month of Damodara, also known as Kartik, is a special time to deepen love and devotion to Lord Krishna. During this holiest of mo...",
      date: "27 October 2026",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Govardhan Puja",
      category: "FESTIVALS",
      description: "Govardhan Puja is celebrated by worshipping Mount Govardhan and offering a mountain of food (Annakut) to Lord Krishna.",
      date: "28 October 2026",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: "Govardhan Puja",
      category: "FESTIVALS",
      description: "Govardhan Puja is celebrated by worshipping Mount Govardhan and offering a mountain of food (Annakut) to Lord Krishna.",
      date: "28 October 2026",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop",
    }
  ];

  // Track window resize to update mobile state and card width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (trackRef.current && trackRef.current.children[0]) {
        const card = trackRef.current.children[0];
        const style = window.getComputedStyle(trackRef.current);
        const gap = parseFloat(style.gap) || 24;
        setCardWidth(card.offsetWidth + gap);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine how many cards are visible based on screen width
  const visibleCount = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, festivals.length - visibleCount);

  // Auto-slide respecting the max limit
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [maxIndex]);


  const [modalMessage, setModalMessage] = useState(null);
  
  // Nitya Seva state
  const [nityaSevaType, setNityaSevaType] = useState('');
  const [nityaSevaAmount, setNityaSevaAmount] = useState('');

  const [isSevaOpen, setIsSevaOpen] = useState(false);
  const [isAmountOpen, setIsAmountOpen] = useState(false);

  // Close dropdowns when clicking outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSevaOpen(false);
        setIsAmountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sevaOptions = [
    "Annadaan Seva",
    "Nitya Deity Seva",
    "Go Seva",
    "Temple Maintenance"
  ];

  const amountOptions = [
    "₹1,000 / month",
    "₹2,500 / month",
    "₹5,000 / month",
    "₹10,000 / month"
  ];

  // Auto-rotate slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleAmountSelect = (cardId, amt) => {
    setSelectedAmounts(prev => ({ ...prev, [cardId]: amt }));
    setCustomInputs(prev => ({ ...prev, [cardId]: '' }));
  };

  const handleCustomChange = (cardId, val) => {
    setCustomInputs(prev => ({ ...prev, [cardId]: val }));
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setSelectedAmounts(prev => ({ ...prev, [cardId]: num }));
    }
  };

  const handleDonate = (title, amount) => {
    setModalMessage(`Thank you for choosing to contribute ₹${amount} for ${title}! Hare Krishna.`);
  };

  const handleStartMonthlySeva = () => {
    if (!nityaSevaType) {
      setModalMessage("Please select a Nitya Seva type first.");
      return;
    }
    if (!nityaSevaAmount) {
      setModalMessage("Please select a monthly amount.");
      return;
    }
    setModalMessage(`Thank you for starting your Monthly ${nityaSevaType} of ₹${nityaSevaAmount}! Hare Krishna.`);
  };

  const services = [
    {
      title: "Annadaan Distribution Seva",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop", // Replace with your image asset
    },
    {
      title: "Speak to a Senior Priest",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop", // Replace with your image asset
    },
    {
      title: "Receive Krishna Prasad",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop", // Replace with your image asset
    }
  ];

  return <>
    <div className="iskcon-app-container">

      {/* Hero Section */}
      
      <Header />
      <header className="iskcon-hero">
        
        {/* Background Image of Sri Sri Radha Madhava */}
        <div className="iskcon-hero-bg">
          <img 
            src="/assets/k5.jpeg" 
            alt="Sri Sri Radha Madhava" 
            className="iskcon-hero-image"
          />
          <div className="iskcon-hero-overlay-gradient"></div>
          <div className="iskcon-hero-overlay-dark"></div>
        </div>

        {/* Hero Content */}
        {/* <div className="iskcon-hero-content-wrapper">
          <div className="iskcon-hero-text-block">
            <h2 className="iskcon-hero-subtitle">
              Abode of
            </h2>
            <h1 className="iskcon-hero-title">
              Sri Sri Radha Nilamadhava
            </h1>
            <p className="iskcon-hero-desc">
              Come experience a spiritual community rooted in devotional service to Lord Krishna, where every day is an opportunity to serve, learn, celebrate and grow in Krishna consciousness.
            </p>
            <div className="iskcon-hero-buttons">
              <button className="iskcon-btn-primary">
                Temple Schedule
              </button>
              <button className="iskcon-btn-outline">
                View Daily Darshan
              </button>
            </div>
          </div>
        </div> */}

        {/* Bottom Bar: Scroll Indicator, Pagination, Rotating Card */}
        <div className="iskcon-hero-bottom-bar">
          
          <div className="iskcon-hero-content-wrapper">
          <div className="iskcon-hero-text-block">
            <h2 className="iskcon-hero-subtitle">
              Abode of
            </h2>
            <h1 className="iskcon-hero-title">
              Sri Sri Radha Nilamadhava
            </h1>
            <p className="iskcon-hero-desc">
              Come experience a spiritual community rooted in devotional service to Lord Krishna, where every day is an opportunity to serve, learn, celebrate and grow in Krishna consciousness.
            </p>
            <div className="iskcon-hero-buttons">
              <button className="iskcon-btn-primary">
                Temple Schedule
              </button>
              <button className="iskcon-btn-outline">
                View Daily Darshan
              </button>
            </div>
          </div>
        </div>

          {/* Bottom Middle: Carousel Pagination Dots */}
          {/* <div className="iskcon-pagination-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`iskcon-dot ${activeSlide === idx ? 'active' : ''}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div> */}

          {/* Bottom Right: Auto-rotating special card carousel (every 5 seconds) */}
          <div className="iskcon-carousel-card">
            <div className="iskcon-card-image-box">
              <img 
                src={slides[activeSlide].image} 
                alt={slides[activeSlide].title} 
                className="iskcon-card-img"
              />
            </div>
            <div className="iskcon-card-content">
              <span className="iskcon-card-tag">
                {slides[activeSlide].category}
              </span>
              <h4 className="iskcon-card-heading">
                {slides[activeSlide].title}
              </h4>
              <p className="iskcon-card-desc">
                {slides[activeSlide].desc}
              </p>
            </div>
          </div>

        </div>

      </header>

      

      {/* Sevas & Contribution Section added from image */}
      <section className="sevas-section">
        <div className="sevas-container">
          <h2 className="sevas-quote-heading">
            “Whatever you do, whatever you eat, whatever you offer or give away... do that as an offering to Me.”
          </h2>
          <p className="sevas-quote-sub">- Bhagavad Gita 9.27</p>

          <div className="sevas-grid">
            {sevaCards.map((card) => {
              const currentAmt = selectedAmounts[card.id];
              const firstAmt = card.amounts[0];
              const dropdownAmounts = card.amounts.slice(1);
              return (
                <div key={card.id} className="seva-card">
                  <div className="seva-img-wrapper">
                    <img src={card.image} alt={card.title} className="seva-img" />
                  </div>
                  <div className="seva-body">
                    <h3 className="seva-title">{card.title}</h3>
                    <p className="seva-description">{card.desc}</p>
                    <div className="seva-amount-label">SELECT AMOUNT</div>
                    <div className="seva-amount-selector-row">
                      <div className="seva-current-badge">
                        <span>₹{currentAmt.toLocaleString()}</span>
                      </div>
                      <select 
                        className="seva-dropdown"
                        value={customInputs[card.id] ? "" : currentAmt}
                        onChange={(e) => {
                          if (e.target.value) {
                            // 1. Update the selected amount
                            handleAmountSelect(card.id, Number(e.target.value));
                            // 2. Clear the custom input so they don't conflict
                            handleCustomChange(card.id, "");
                          }
                        }}
                      >
                        <option value="" disabled hidden>
                          {customInputs[card.id] ? "Custom Active" : "Select Amount"}
                        </option>
                        <option value={firstAmt}>
                          ₹{firstAmt.toLocaleString()}
                        </option>
                        {dropdownAmounts.map((amt) => (
                          <option key={amt} value={amt}>
                            ₹{amt.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Type Amount"
                        value={customInputs[card.id]}
                        onChange={(e) => handleCustomChange(card.id, e.target.value)}
                        className="seva-custom-input"
                      />
                    </div>
                    <button
                      onClick={() => handleDonate(card.title, currentAmt)}
                      className="seva-donate-action"
                    >
                      Donate ₹{currentAmt.toLocaleString()}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nitya Seva Banner Added Here */}
      <div className="nitya-seva-banner-wrapper">
        <div className="nitya-seva-card">
          <div className="nitya-seva-left">
            <span className="nitya-seva-tag">NITYA SEVA</span>
            <h2 className="nitya-seva-title">Offer a Little Every Month</h2>
            <p className="nitya-seva-desc">
              Nitya Seva is a heartfelt offering of devotion. Your regular contribution supports the Lord's daily worship and helps provide nourishing prasadam to the hungry and those in need.
            </p>
          </div>
          <div className="nitya-seva-right" ref={dropdownRef}>
            <div className="nitya-seva-inputs-row">
              
              {/* Custom Seva Dropdown */}
              <div className="nitya-seva-input-group">
                <label className="nitya-seva-label">Choose Nitya Seva</label>
                <div className="custom-dropdown">
                  <div 
                    className="nitya-seva-select"
                    onClick={() => { setIsSevaOpen(!isSevaOpen); setIsAmountOpen(false); }}
                  >
                    <span className={nityaSevaType ? "selected-text" : "placeholder-text"}>
                      {nityaSevaType || "Select Seva"}
                    </span>
                    <span className="arrow">&#9662;</span>
                  </div>

                  {isSevaOpen && (
                    <div className="dropdown-menu">
                      {sevaOptions.map((option, index) => (
                        <div 
                          key={index}
                          className={`dropdown-item ${nityaSevaType === option ? 'active' : ''}`}
                          onClick={() => {
                            setNityaSevaType(option);
                            setIsSevaOpen(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Amount Dropdown */}
              <div className="nitya-seva-input-group">
                <label className="nitya-seva-label">Choose Monthly Amount</label>
                <div className="custom-dropdown">
                  <div 
                    className="nitya-seva-select"
                    onClick={() => { setIsAmountOpen(!isAmountOpen); setIsSevaOpen(false); }}
                  >
                    <span className={nityaSevaAmount ? "selected-text" : "placeholder-text"}>
                      {nityaSevaAmount || "Select Amount"}
                    </span>
                    <span className="arrow">&#9662;</span>
                  </div>

                  {isAmountOpen && (
                    <div className="dropdown-menu">
                      {amountOptions.map((option, index) => (
                        <div 
                          key={index}
                          className={`dropdown-item ${nityaSevaAmount === option ? 'active' : ''}`}
                          onClick={() => {
                            setNityaSevaAmount(option);
                            setIsAmountOpen(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="nitya-seva-btn"
                onClick={handleStartMonthlySeva}
              >
                Start Monthly Seva
              </button>
            </div>

            <p className="nitya-seva-note">
              * All donations are eligible for an 80G tax exemption certificate and an instant receipt.
            </p>
          </div>
        </div>
      </div>

      <div className="festivals-section">
        {/* Header Row */}
        <div className="festivals-header">
          <div>
            <h2 className="festivals-title">Upcoming Festivals</h2>
            <p className="festivals-subtitle">
              Celebrate the sacred festivals of the Vaishnava tradition and immerse yourself in divine pastimes, teachings, and joyful devotion.
            </p>
          </div>
          <button className="view-all-btn">VIEW ALL FESTIVALS</button>
        </div>

        {/* Carousel Viewport */}
        <div className="carousel-viewport">
          <div 
            className="festivals-track"
            ref={trackRef}
            style={{ transform: `translateX(-${activeIndex * cardWidth}px)` }}
          >
            {festivals.map((festival, index) => (
              <div className="festival-card" key={index}>
                <div className="festival-image-wrapper">
                  <img src={festival.image} alt={festival.title} className="festival-img" />
                </div>
                
                <div className="festival-content">
                  <span className="festival-badge">{festival.category}</span>
                  <h3 className="festival-card-title">{festival.title}</h3>
                  <p className="festival-desc">{festival.description}</p>
                  
                  <div className="festival-footer">
                    <span className="festival-date">
                      📅 {festival.date}
                    </span>
                    <button className="support-btn">Support</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Pagination Dots */}
        <div className="pagination-dots">
          {festivals.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            ></span>
          ))}
        </div>
      </div>

      <section className="devotional-services-section">
        {/* Header Row */}
        <div className="services-header">
          <div>
            <h2 className="services-title">Devotional Services</h2>
            <p className="services-subtitle">
              Invite the mercy of Sri Sri Radha Madhava into your home. Offer Puja, counseling, prasad delivery, or download books.
            </p>
          </div>
          <button className="view-all-services-btn">VIEW ALL SERVICES</button>
        </div>

        {/* Cards Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-image-wrapper">
                <img src={service.image} alt={service.title} className="service-img" />
              </div>
              
              {/* Overlapping Bottom Card Title Box */}
              <div className="service-title-box">
                <span className="service-card-title">{service.title}</span>
                <span className="service-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>


      

      {/* Modal Popup */}
      {modalMessage && (
        <div className="modal-overlay" onClick={() => setModalMessage(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <Sparkles className="modal-icon" />
            <h3 className="modal-title">Seva Contribution</h3>
            <p className="modal-text">{modalMessage}</p>
            <button onClick={() => setModalMessage(null)} className="modal-close-btn">
              Close / Proceed
            </button>
          </div>
        </div>
      )}

      {/* Quick Info Footer Banner */}
      <section className="iskcon-info-footer">
        <div className="iskcon-info-container">
          <div className="iskcon-info-item">
            <MapPin className="iskcon-info-icon" />
            <div>
              <h5 className="iskcon-info-title">Temple Location</h5>
              <p className="iskcon-info-text">Plot No 220, MIG Road No 34, HUDA Colony, Attapur, Hyderabad - 500064</p>
            </div>
          </div>
          <div className="iskcon-info-item">
            <Clock className="iskcon-info-icon" />
            <div>
              <h5 className="iskcon-info-title">Darshan Timings</h5>
              <p className="iskcon-info-text">4:30 AM – 1:00 PM | 4:00 PM – 8:30 PM daily</p>
            </div>
          </div>
          <div className="iskcon-info-item">
            <Phone className="iskcon-info-icon" />
            <div>
              <h5 className="iskcon-info-title">Contact & Seva Desk</h5>
              <p className="iskcon-info-text">+91 79837 48776 | info@iskconattapur.com</p>
            </div>
          </div>
        </div>
      </section>

    </div>
    <PinSpacer />
    <BirthdayHandler />
    <Welcome />
    <Gallery />
    <Mission />
    <Founder />
    <VideoComponent />
    <Temple />
    <DirectDonation />
    <DonateCategories />
    <NewsArticles />
    <Floating />
    <Foooter />
  </>

}

export default Home;
