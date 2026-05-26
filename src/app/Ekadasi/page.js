'use client'
import { useEffect, useState, useRef } from "react"
import axios from 'axios'
import { useRouter } from "next/navigation"
// import HandlePayment from "@/Helpers/HandlePayment"
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import "./ekadasiannadan.css"
import { FiCopy, FiCheck } from "react-icons/fi";
import DirectDonation from "@/Components/Direct_donation_and_80G"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useDonate } from "@/Helpers/PaymentPageHandler";
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Ekadasi() {
    const router = useRouter()
    const { handleDonateClick } = useDonate();
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)

    // Create a ref for the donation section
    const donationRef = useRef(null);

    const ekadasi_name = "Padmini";

    const [amount, setAmount] = useState();

    const scrollToDonation = () => {
        donationRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const donationoptions = {
        'Ekadasi Prasad Seva': [
            { title: "Ekadasi Prasad (For 10 Devotees)", price: 1116},
            { title: "Ekadasi Prasad (For 15 Devotees)", price: 1516},
            { title: "Ekadasi Prasad (For 30 Devotees)", price: 3116},
            { title: "Ekadasi Prasad (For 50 Devotees)", price: 5116},
            { title: "Ekadasi Prasad (For 100 Devotees)", price: 10116},
        ],
        'Ekadasi Go Seva': [
            { title: "Go Seva (Feed 1 Cow)", price: 116},
            { title: "Go Seva (Feed 2 Cows)", price: 216},
        ]
    }

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
                    src="/images/full-alter.jpeg" 
                    alt="Rath Construction" 
                    className="hero-image" 
                />
            </picture>
            <div className="hero-content-ekadasi">
                
                <div className="date-badge">27 May 2026</div>
                <p className="hero-title-ekadasi">Donate on Auspicious {ekadasi_name} Ekadasi</p>
                {/* Parana Time Highlight */}
                <div className="parana-info">
                    <p className="parana-text">
                        Fast breaking parana time: 28 May 2026, 5:42 AM to 08:02 AM for Warangal.
                    </p>
                </div>
            </div>
            
            </section>
            
            <div className="description-section">
                {/* Spiritual Significance Paragraph */}
                <p className="hero-description">
                    <b>Suta Goswami to Saunaka Risi</b> : Anyone who devotedly fasts on this Ekadasis that occur during the extra, 
                    leap-year months, carefully following all the rules, becomes glorious and 
                    happily goes back to Godhead. And one who merely hears or reads about these 
                    Ekadasis will also obtain great merit and ultimately enter the abode of Lord Sri Hari.
                </p>
                {/* Read More Button */}
                <button className="read-more-btn"><a href="https://iskcondesiretree.com/page/padmini-ekadasi" target="_blank">Read more</a></button>
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
                            <button className="donate-action-btn" onClick={() =>handleDonateClick(tier.price, tier.title)}>
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
                        handleDonateClick(amount, "Apara Ekadasi Seva");
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
            <Floating />
            
            <Foooter />
        </>
    )
}