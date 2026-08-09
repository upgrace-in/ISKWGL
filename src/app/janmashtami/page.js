'use client'
import { useEffect, useState, useRef } from "react"
import axios from 'axios'
import { useRouter } from "next/navigation"
// import HandlePayment from "@/Helpers/HandlePayment"
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import { FiCopy, FiCheck } from "react-icons/fi";
import DirectDonation from "@/Components/Direct_donation_and_80G"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import './JanmashtamiPage.css';
import pastimeImages from "../pastimesImages.json";
import { useDonateTest } from "@/Helpers/PaymentPageHandler-copy";

export default function FoodForLife({ }) {
    const router = useRouter()
    const { handleDonateClick } = useDonateTest();
    const [navOpen, setNavOpen] = useState(false)

    const [currentSlide, setCurrentSlide] = useState(0);
    // Hero Background Slideshow State
    const [heroIndex, setHeroIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [amount, setAmount] = useState(0);

    // 1. Desktop Hero Images
    const desktopHeroImages = [
      "/images/Janmastami/hero-image/desktop/first.jpg",
      "/images/Janmastami/hero-image/desktop/second.jpg",
      "/images/Janmastami/hero-image/desktop/third.jpg",
      "/images/Janmastami/hero-image/desktop/fourth.jpg",
      "/images/Janmastami/hero-image/desktop/fifth.jpg",
      "/images/Janmastami/hero-image/desktop/sixth.jpg"
    ];

    // 2. Mobile Hero Images (Portrait aspect ratios)
    const mobileHeroImages = [
      "/images/Janmastami/hero-image/mobile/first.jpg",
      "/images/Janmastami/hero-image/mobile/second.jpg",
      "/images/Janmastami/hero-image/mobile/third.jpg",
      "/images/Janmastami/hero-image/mobile/fourth.jpg",
      "/images/Janmastami/hero-image/mobile/fifth.jpg",
      "/images/Janmastami/hero-image/mobile/sixth.jpg"
    ];

    // Detect Mobile Viewport (< 768px)
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile(); // Check on mount
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Select active image list based on viewport
    const heroImages = isMobile ? mobileHeroImages : desktopHeroImages;

  // 2. Updated gallery slides to use local public paths instead of external Unsplash links
  const slides = [
    {
      url: "/images/Janmastami/icons/balaram.jpg",
      caption: "Grand Shringar & Midnight Aarti",
    },
    {
      url: "/images/Janmastami/icons/tulasi.webp",
      caption: "Pushpa Abhishekam Ceremonies",
    },
    {
      url: "/images/Janmastami/icons/govardhan.jpg",
      caption: "Ecstatic Kirtan & Devotional Bliss",
    },
  ];

  // Set 1: Prasadam Sevas with image paths
  const prasadamSevasRaw = [
    { id: "sudama", name: "Sudama Seva", count: "50 cups", price: "₹500", rawPrice: 500, image: "/images/Janmastami/icons/sudama.jpg" },
    { id: "tulasi", name: "Tulasi Seva", count: "100 cups", price: "₹1,000", rawPrice: 1000, image: "/images/Janmastami/icons/tulasi.webp" },
    { id: "govardhan", name: "Govardhan Seva", count: "200 cups", price: "₹2,000", rawPrice: 2000, image: "/images/Janmastami/icons/govardhan.jpg" },
    { id: "yamuna", name: "Yamuna Seva", count: "500 cups", price: "₹5,000", rawPrice: 5000, image: "/images/Janmastami/icons/yamuna.jpg" },
    { id: "vrindavan", name: "Vrindavan Seva", count: "1000 cups", price: "₹10,000", rawPrice: 10000, image: "/images/Janmastami/icons/vrindavan.jpg" },
    { id: "balaram", name: "Balaram Seva", count: "2000 cups", price: "₹20,000", rawPrice: 20000, image: "/images/Janmastami/icons/balaram.jpg" },
    { id: "nilamadhav", name: "Nilamadhav Seva", count: "5000 cups", price: "₹50,000", rawPrice: 50000, image: "/images/Janmastami/icons/nilmadhav.png" },
    { id: "vasudev_devaki", name: "Vasudev Devaki Seva", count: "10,000 cups", price: "₹1,00,000", rawPrice: 100000, image: "/images/Janmastami/icons/vasudev-devaki.jpg" },
    { id: "nanda_yasoda", name: "Nanda Yasoda Seva", count: "20,000 cups", price: "₹2,00,000", rawPrice: 200000, image: "/images/Janmastami/icons/nanda-yasoda.jpg" },
  ];

  // Set 2: Special Sponsorships with image paths
  const specialSponsorshipsRaw = [
    { id: "prabhupada_abhishekam", name: "Srila Prabhupada Abhishekam", price: "₹10,000", rawPrice: 10000, image: "/images/Janmastami/icons/prabhupada.png" },
    { id: "maha_abhishekam", name: "Maha Abhishekam", price: "₹20,000", rawPrice: 20000, image: "/images/Janmastami/icons/abhishekam.png" },
    { id: "prasadam_boxes", name: "Prasadam Boxes", price: "₹30,000", rawPrice: 30000, image: "/images/Janmastami/icons/prasadam.png" },
    { id: "deity_dress", name: "New Deity Dress", price: "₹50,000", rawPrice: 50000, image: "/images/Janmastami/icons/dress.png" },
    { id: "sound_light", name: "Sound & Light", price: "₹50,000", rawPrice: 50000, image: "/images/Janmastami/icons/sound.png" },
    { id: "night_prasadam", name: "Night Prasadam", price: "₹60,000", rawPrice: 60000, image: "/images/Janmastami/icons/night_prasadam.png" },
    { id: "nandotsav_prasadam", name: "Nandotsav Prasadam", price: "₹60,000", rawPrice: 60000, image: "/images/Janmastami/icons/nandotsav.png" },
    { id: "flower_decoration", name: "Flower Decoration", price: "₹80,000", rawPrice: 80000, image: "/images/Janmastami/icons/flowers.png" },
    { id: "pandal", name: "Pandal Sponsorship", price: "₹1,50,000", rawPrice: 150000, image: "/images/Janmastami/icons/pandal.png" },
  ];
    const [activeTab, setActiveTab] = useState('prasadam'); // 'prasadam' or 'special'
    const [expandedCardId, setExpandedCardId] = useState(null);

  const toggleGifts = (id) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

    // Reverse the array based on selected tab
    // const rawSevas = activeTab === 'prasadam' ? prasadamSevas : specialSponsorships;
    // const activeSevas = [...rawSevas].reverse(); // Reverses the items for rendering

    // Helper function to dynamically attach gifts based on rawPrice
    const getDonorGifts = (price) => {
      const gifts = [];

      // Table Gifts (Image Source)
      if (price < 1000) {
        gifts.push("2 Laddus");
      }
      if (price >= 1000) {
        gifts.push("Prasadam Box", "Charanamrita Bottle");
      }
      if (price >= 2000) {
        gifts.push("Acrylic / Murti");
      }
      if (price >= 10000) {
        gifts.push("Big Bag");
      }
      if (price === 20000) {
        gifts.push("Small Trophy");
      }
      if (price >= 50000) {
        gifts.push("Big Trophy");
      }
      if (price === 50000) {
        gifts.push("Silver Pramidalu");
      }
      if (price === 100000) {
        gifts.push("Silver Ganta");
      }
      if (price >= 200000) {
        gifts.push("SP 125 Coin");
      }

      // Text Rules (Conditional Perks)
      if (price >= 1000 && price < 2000) {
        gifts.push("Participate in Dugdha Abhishekam");
      }
      if (price >= 2000) {
        gifts.push("Participate in Panchamrita Abhishekam");
      }
      if (price >= 10000) {
        gifts.push("VIP Pass (Quick Darshan & Special Prasadam for max 4 people)");
      }

      return gifts;
    };

    // Map dynamic gifts and reverse order
    const [isExpanded, setIsExpanded] = useState(false);
  const selectedList = activeTab === "prasadam" ? prasadamSevasRaw : specialSponsorshipsRaw;
  const activeSevas = selectedList
    .map((item) => ({ ...item, gifts: getDonorGifts(item.rawPrice) }))
    .reverse();

  const schedule = [
    { time: "04:30 AM - 5:15 AM", title: "Mangal Aarti"},
    { time: "07:00 AM - 08:00 AM", title: "Festival Class"},
    { time: "08:00 AM - 08:30 AM", title: "Guru Puja & Darshan Arati"},
    { time: "09:00 AM - 10:00 PM", title: "Darshan, Kirtan, Donor Abhishekam, Cultural Programs"},
    { time: "10:00 PM onwards", title: "Maha Abhishekam, Class, Arati, Prasadam for all"}
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Hero Background Smooth Switch
  // useEffect(() => {
  //   const heroTimer = setInterval(() => {
  //     setHeroIndex((prevIndex) => {
  //       let nextIndex;
  //       do {
  //         nextIndex = Math.floor(Math.random() * heroImages.length);
  //       } while (nextIndex === prevIndex && heroImages.length > 1);
  //       return nextIndex;
  //     });
  //   }, 10000);

  //   return () => clearInterval(heroTimer);
  // }, [heroImages.length]);

    useEffect(() => {
      const heroTimer = setInterval(() => {
        setHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 6000);

      return () => clearInterval(heroTimer);
    }, [heroImages.length]);

    const [selectedPastimeIndex, setSelectedPastimeIndex] = useState(null);
    const [mobileIndex, setMobileIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    

    // Detect Mobile Screen Size (< 768px)
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize(); // Initial check
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Desktop Scroll Handlers
    const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
    const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" });

    // Mobile Slideshow Handlers
    const nextMobileSlide = () => setMobileIndex((prev) => (prev + 1) % pastimeImages.length);
    const prevMobileSlide = () => setMobileIndex((prev) => (prev === 0 ? pastimeImages.length - 1 : prev - 1));

    // Lightbox Handlers
    const nextPastime = (e) => {
      e.stopPropagation();
      setSelectedPastimeIndex((prev) => (prev === pastimeImages.length - 1 ? 0 : prev + 1));
    };

    const prevPastime = (e) => {
      e.stopPropagation();
      setSelectedPastimeIndex((prev) => (prev === 0 ? pastimeImages.length - 1 : prev - 1));
    };

    return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />

            <div className="page-container">
              {/* HERO SECTION */}
              <header className="hero-section">
                

                {/* Subtle gradient overlay to keep white text readable on bright images */}
                <div className="hero-overlay" />

                <div className="hero-content">
                  <h1 className="hero-title">Shri Krishna Janmashtami</h1>

                  <div className="event-date-badge">
                    📅 Wednesday, September 2, 2026
                  </div>

                  {/* <div className="hero-tagline">
                    <span className="sparkle-icon">✦</span> Join Us In The Divine Celebration <span className="sparkle-icon">✦</span>
                  </div> */}

                  <div className="hero-buttons">
                    <a href="#donate" className="btn btn-primary">
                      ❤️ Offer Seva
                    </a>
                    <a href="#invite" className="btn btn-secondary">
                      Event Schedule
                    </a>
                    
                  </div>
                </div>
              </header>

              <section id="donate" className="section-container">
      <div className="section-header">
        <h2 className="section-title">Janmashtami Seva Opportunities</h2>
        {/* <p className="section-subtitle">
          Join us in sponsoring Prasadam & Festival Sevas.
        </p> */}

        {/* VIP Prasadam Note Banner */}
        <div className="vip-timing-banner">
          <p>🎟️ Every donation between Rs. 1,000/- to Rs. 1,999/- can participate in <strong>Dugdha Abhishekam </strong></p>
          <p>🎟️ Every donation above Rs. 2,000/- can participate in <strong>Panchamrita Abhishekam </strong></p>
          <p>🎟️ Every donation above Rs. 10,000/- can avail <strong>VIP Pass</strong> </p>
          <p>🎟️ <strong>VIP Prasadam Timings:</strong> 12:00 PM – 2:00 PM & 7:00 PM – 10:00 PM</p>
        </div>

        {/* Tab Buttons */}
        <div className="seva-tab-container">
          <button
            className={`seva-tab-btn ${activeTab === "prasadam" ? "active" : ""}`}
            onClick={() => setActiveTab("prasadam")}
          >
            🍃 Leaf Cup Prasadam Sevas
          </button>
          <button
            className={`seva-tab-btn ${activeTab === "special" ? "active" : ""}`}
            onClick={() => setActiveTab("special")}
          >
            ✨ Special Sponsorship Opportunities
          </button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="donation-grid">
      {activeSevas.map((tier) => {
        const isExpanded = expandedCardId === tier.id;

        return (
          <div key={tier.id} className="donation-card">
            <div className="card-top-content">
              {/* Image + Title */}
              <div className="seva-header-row">
                <div className="seva-icon-box">
                  <img src={tier.image} alt={tier.name} className="seva-icon-img" />
                </div>
                <div className="seva-title-group">
                  <h3 className="tier-name">{tier.name}</h3>
                  {tier.count && <span className="tier-count">({tier.count})</span>}
                </div>
              </div>

              {/* Expandable Gifts Section */}
              {tier.gifts && tier.gifts.length > 0 && (
                <div className="gifts-accordion-container">
                  <button
                    type="button"
                    onClick={() => toggleGifts(tier.id)}
                    className="gift-toggle-btn"
                  >
                    <span className={`accordion-arrow ${isExpanded ? "open" : ""}`}>
                      ›
                    </span>
                    🎁 Donor Gifts & Privileges ({tier.gifts.length})
                  </button>

                  {isExpanded && (
                    <div className="gift-box">
                      <ul className="gift-list">
                        {tier.gifts.map((gift, idx) => (
                          <li key={idx} className="gift-item">
                            <span className="check-icon">✓</span> {gift}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="donate-btn popular-donate-btn" onClick={() =>handleDonateClick(tier.rawPrice, tier.name, "Janmashtami")}>
              Offer Seva ({tier.price})
            </button>
          </div>
        );
      })}
    </div>
      
    </section>

              <section className="customdonation">
                <div  >
                <h3 className="custom-title">Custom Donation</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleDonateClick(amount, "Janmashtami", "Janmashtami");
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
                        >
                            Donate Now
                        </button>
                    </form>
              </div>
              </section>

              

        {/* SLIDESHOW / GALLERY SECTION */}
        {/* <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">Glimpses of Celebration</h2>
            <p className="section-subtitle">A glimpse into our past Mahotsav celebrations</p>
          </div>

          <div className="slideshow-wrapper">
            <img 
              src={slides[currentSlide].url} 
              alt={slides[currentSlide].caption} 
              className="slide-image"
            />
            <div className="slide-overlay" />
            
            <div className="slide-caption">
              {slides[currentSlide].caption}
            </div>

            <button onClick={prevSlide} className="slide-nav-btn prev-btn">
              ❮
            </button>
            <button onClick={nextSlide} className="slide-nav-btn next-btn">
              ❯
            </button>

            <div className="slide-indicators">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`indicator-dot ${currentSlide === idx ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </section> */}

        {/* EVENT SCHEDULE SECTION */}
        <section className="schedule-section" id="invite">
      <div className="schedule-container">
        <div className="schedule-header">
          <span className="schedule-subtitle">✨ Divine Timings</span>
          <h2 className="schedule-title">Festival Schedule</h2>
        </div>

        <div className="timeline-container">
          {schedule.map((item, index) => (
            <div 
              key={index} 
              className={`timeline-item ${item.highlight ? "highlight-item" : ""}`}
            >
              {/* Left Column: Time Badge */}
              <div className="time-badge">
                <span className="clock-icon">⏰</span>
                <span className="time-text">{item.time}</span>
              </div>

              {/* Middle: Vertical Connector Dot */}
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                {index !== schedule.length - 1 && <div className="marker-line"></div>}
              </div>

              {/* Right Column: Event Card */}
              <div className="event-card">
                <h3 className="event-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

        <section className="section-container pastimes-section">
          <div className="section-header">
            <h2 className="section-title">Transcendental Pastimes of Lord Krishna</h2>
            <p className="section-subtitle">
              Explore the divine Leelas and glories of Lord Shyamasundar
            </p>
          </div>

          {isMobile ? (
            /* 📱 MOBILE VIEW: Full-Width Single Image Slideshow */
            <div className="pastimes-mobile-slideshow">
              <div 
                className="mobile-slide-card" 
                onClick={() => setSelectedPastimeIndex(mobileIndex)}
              >
                <img 
                  src={pastimeImages[mobileIndex]?.src} 
                  alt={pastimeImages[mobileIndex]?.title} 
                  className="mobile-slide-img" 
                />
                <div className="mobile-slide-caption">
                  <span className="zoom-icon">🔍</span>
                  <p>{pastimeImages[mobileIndex]?.title}</p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mobile-controls">
                <button className="mobile-nav-btn" onClick={prevMobileSlide}>❮</button>
                <span className="mobile-counter">
                  {mobileIndex + 1} / {pastimeImages.length}
                </span>
                <button className="mobile-nav-btn" onClick={nextMobileSlide}>❯</button>
              </div>
            </div>
          ) : (
            /* 💻 DESKTOP VIEW: Horizontal Scroll Row */
            <div className="pastimes-carousel-wrapper">
              <button className="slider-btn left-btn" onClick={scrollLeft} aria-label="Scroll left">
                ❮
              </button>

              <div className="pastimes-scroll-row" ref={scrollContainerRef}>
                {pastimeImages.map((item, index) => (
                  <div
                    key={index}
                    className="pastime-row-card"
                    onClick={() => setSelectedPastimeIndex(index)}
                  >
                    <img src={item.src} alt={item.title} className="pastime-row-img" loading="lazy" />
                    <div className="pastime-row-overlay">
                      <span className="zoom-icon">🔍</span>
                      <p className="pastime-card-title">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="slider-btn right-btn" onClick={scrollRight} aria-label="Scroll right">
                ❯
              </button>
            </div>
          )}

              {/* FULL-SCREEN LIGHTBOX MODAL */}
          {selectedPastimeIndex !== null && (
            <div className="lightbox-overlay" onClick={() => setSelectedPastimeIndex(null)}>
              <button className="lightbox-close" onClick={() => setSelectedPastimeIndex(null)}>✕</button>

              <button className="lightbox-nav-btn prev" onClick={prevPastime}>❮</button>

              <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img
                  src={pastimeImages[selectedPastimeIndex].src}
                  alt={pastimeImages[selectedPastimeIndex].title}
                  className="lightbox-image"
                />
                <div className="lightbox-caption">
                  {pastimeImages[selectedPastimeIndex].title}
                </div>
              </div>

              <button className="lightbox-nav-btn next" onClick={nextPastime}>❯</button>
            </div>
          )}
        </section>

        
      </div>

            <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
                <DirectDonation />
            </div>
            <Floating />
            
            <Foooter />
        </>
    )
}