'use client'
import { useEffect, useState, useRef } from "react"
import axios from 'axios'
import { useRouter } from "next/navigation"
// import HandlePayment from "@/Helpers/HandlePayment"
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import "./foodforlife.css"
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
import './gallery.css'; // Custom styles for your project

import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css'; // Normal weight
import '@fontsource/open-sans/700.css'; // Bold weight

export default function FoodForLife({ }) {
    const router = useRouter()
    const { handleDonateClick } = useDonate();
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)
    
    // Create a ref for the donation section
    const donationRef = useRef(null);

    const photos = [
        { src: '/donateForIMGs/images_for_ffl_card/ffl-1.jpeg', alt: 'Annadanam Event 1' },
        { src: '/donateForIMGs/images_for_ffl_card/ffl-2.jpeg', alt: 'Annadanam Event 2' },
        { src: '/donateForIMGs/images_for_ffl_card/ffl-3.jpeg', alt: 'Annadanam Event 3' },
        { src: '/donateForIMGs/images_for_ffl_card/ffl-4.jpeg', alt: 'Annadanam Event 4' },
        { src: '/donateForIMGs/images_for_ffl_card/ffl-5.jpeg', alt: 'Annadanam Event 5' },
    ];

    
    const donationTiers = [
        {
            category: "TIER 1 - FEEDING INITIATIVES",
            plans: [
                { title: "AnnaDaan(For 10 People)", amount: 5, price: 256, desc: "Individual Support" },
                { title: "AnnaDaan(For 20 People)", amount: 10, price: 516, desc: "Family Sustenance"},
                { title: "AnnaDaan(For 40 People)", amount: 20, price: 1016, desc: "Classroom Support", featured: true},
            ]
        },
        {
            category: "TIER 2 - BULK COMMUNITY SUPPORT",
            plans: [
                { title: "AnnaDaan(For 80 People)", amount: 30, price: 2016, desc: "Community Meal" },
                { title: "AnnaDaan(For 100 People)", amount: 40, price: 2516, desc: "Village Initiative"},
                { title: "AnnaDaan(For 120 People)", amount: 50, price: 3016, desc: "Mass Distribution", featured: true },
            ]
        },
        {
            category: "TIER 3 - SUSTENANCE PROGRAMS",
            plans: [
                { title: "AnnaDaan(For 200 People)", amount: 30, price: 5016, desc: "Community Meal" },
                { title: "AnnaDaan(For 240 People)", amount: 40, price: 6016, desc: "Village Initiative"},
                { title: "AnnaDaan(For 300 People)", amount: 50, price: 7516, desc: "Mass Distribution", featured: true },
            ]
        }
    ];

    const allPlans = donationTiers.flatMap(tier => tier.plans);
    const defaultPlan = allPlans.find(p => p.title === "100 People") || allPlans[0];

    const [selectedPlan, setSelectedPlan] = useState(defaultPlan) 
    const [amount, setAmount] = useState(defaultPlan.price);
    // const [status, setStatus] = useState({})

    const scrollToDonation = () => {
        donationRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // const handlePlanSelect = (plan) => {
    //     setSelectedPlan(plan);
    //     if (plan.title !== "Custom") {
    //         setAmount(plan.price);
    //     }
    // }

    // const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     let finalData = {}
    //     const formData = new FormData(e.target)
    //     formData.forEach((value, property) => finalData[property] = value);
    //     finalData['donationType'] = selectedPlan.title;
    //     finalData['amount'] = amount;

    //     try {
    //         const response = await axios.post(`/api/createDonation/`, finalData)
    //         if (response?.status === 200) setData(response.data)
    //     } catch (e) {
    //         setStatus({ ...e, default: false })
    //     }
    // }
    // const { setDonationData } = useDonation();
    // const handleDonateClick = (price, reason) => {
    //     // We encode the reason to handle spaces and special characters safely
    //     // const encodedReason = encodeURIComponent(selectedPlan.title);
    //     // const selectedAmount = selectedPlan.price; // This would be your dynamic state variable
    //     setDonationData({
    //         amount: price,
    //         reason: reason
    //     });

    //     router.push('/payment-page');
    // };

    const buttonStyle = {
        background: 'linear-gradient(135deg, #d4a054 0%, #6b2d2d 100%)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
        margin: '0 auto',
    };
    const [copiedItem, setCopiedItem] = useState(null);
    const copyText = (text,key) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(key);

        // revert icon back after 2 seconds
        setTimeout(() => {
            setCopiedItem(null);
        }, 2000);
    };

    const bank_details = [
        { label: "Bank Name", value: "ICICI Bank" },
        { label: "Account Name", value: "ISKCON" },
        { label: "Account No.", value: "092201002821" },
        { label: "IFSC Code", value: "ICIC0000922" }
    ];
    const upiid_details = [
        { label: "UPI ID", value: "donate.iskcon@icici"}
    ];

    return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            

            {/* <section className="hero-section">
                <div className="hero-overlay">
                </div>
            </section> */}
            
                    <div className="hero-content">
                        <p className="hero-title">Anna Daan</p>
                        <h1 className="hero-subtext">Help Us Feed the Needy</h1>
                        <div className="hero-line"></div>
                    </div>
            <div className="gallery-section">
                
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    spaceBetween={0} // Set to 0 for a cleaner full-width look on mobile
                    slidesPerView={1} // Set default to 1
                    navigation = {false}
                    pagination={{ clickable: true }}
                    speed={4000}
                    autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    loop={true}
                    cssMode={false} 
                    allowTouchMove={true}
                    breakpoints={{
                        // When window width is >= 320px (Mobile)
                        320: { 
                            slidesPerView: 1,
                            spaceBetween: 10 
                        },
                        // When window width is >= 768px (Tablet)
                        768: { 
                            slidesPerView: 2, 
                            spaceBetween: 20 
                        },
                        // When window width is >= 1024px (Desktop)
                        1024: { 
                            slidesPerView: 3, 
                            spaceBetween: 30 
                        },
                    }}
                    className="mySwiper"
                >
                    {photos.map((photo, index) => (
                        <SwiperSlide key={index}>
                            <div className="gallery-image-wrapper">
                                <img src={photo.src} alt={photo.alt} className="gallery-img" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="container">
                <div className="about-ffl-section">
                    <h2>What is Anna Daan?</h2>
                    <p><b>
                        The Anna Daan (Food For Life) initiative by ISKCON, inspired by the teachings of Srila Prabhupada, 
                        the founder of ISKCON, provides nutritious vegetarian meals globally, embodying the 
                        principle of {"\"Prasadam\""} to nourish both body and soul. Through compassionate outreach, 
                        it aims to alleviate hunger, promote social equality and foster a caring global community.</b>
                    </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                    <button style={buttonStyle} onClick={scrollToDonation}>
                        Contribute Now
                    </button>
                </div>
                
                

                
            
                {/* --- New Consistent Donation Design --- */}
                <div className="donation-card-wrapper">
                    
                    <div className="tier-container" ref={donationRef}>
                        {donationTiers.map((tier, index) => (
                            <div key={index} className="tier-column">
                                <div className="tier-header">{tier.category}</div>
                                <div className="tier-content">
                                    {tier.plans.map((plan, i) => (
                                        <div 
                                            key={i} 
                                            className="impact-card-v2"
                                            // onClick={() => handlePlanSelect(plan)}
                                        >
                                            {/* Render ribbon only if ribbonText exists */}
                                            {plan.ribbonText && (
                                                <div 
                                                    className="dynamic-ribbon" 
                                                    style={{ 
                                                        '--ribbon-text': `"${plan.ribbonText}"`, // Note the double quotes inside backticks
                                                        '--ribbon-bg': plan.ribbonColor || '#1a2a4a' 
                                                    }}
                                                ></div>
                                            )}

                                            <div className="card-body-horizontal">
                                                <div className="card-details">
                                                    <div className="tier-title">{`${plan.title}`}</div>
                                                    {/* <div className="tier-title">{plan.isSpecial ? plan.title : `${plan.title}`}</div> */}
                                                    {/* <p className="price-text">₹ {plan.price.toLocaleString()}</p> */}
                                                    {plan.isSpecial && <p className="special-label">Make a Lasting Impact</p>}
                                                </div>
                                            </div>
                                            <button type="button" className="action-btn" onClick={() =>handleDonateClick(plan.price, plan.title)}><b>
                                                Donate ₹{plan.price}</b>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <h3>Custom Donation</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleDonateClick(amount, "AnnaDaan");
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
                
                <section className="benefits-section">
                    <div className="about-ffl-section">
                        <h2>Donation Benefits</h2>
                    </div>
                    <p className="benefits-subtitle">
                        By donating to Anna Daan, you will not only be supporting a noble cause, but you will also receive several benefits:
                    </p>

                    <div className="benefits-grid">
                        {/* Card 1 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                {/* Replace with your specific SVG or Icon */}
                                <img src="/Icons/tax.webp" alt="Tax" width="70" height="70" style={{marginBottom: '20px', marginLeft: '0px'}}/>
                            </div>
                            <h3>Tax Exemption</h3>
                            <p>Your donation is eligible for tax exemption under Section 80G of the Income Tax Act.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <img src="/Icons/spiritual.jpg" alt="Spiritual" width="90" height="90"  style={{marginBottom: '0px', marginLeft: '0px'}}/>
                            </div>
                            <h3>Spiritual Benefits</h3>
                            <p>By participating in the sacred act of anna daan, you will be accumulating spiritual merit and blessings.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <img src="/Icons/updates.jpg" alt="Updates" width="90" height="90" />
                            </div>
                            <h3>Updates on Impact</h3>
                            <p>We will keep you informed about the impact of your donation through regular newsletters and updates.</p>
                        </div>

                        {/* Card 4 */}
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <img src="/Icons/fulfillment.webp" alt="Fulfillment" width="110" height="110" style={{marginBottom: '-10px', marginTop: '-10px'}} />
                            </div>
                            <h3>Sense of Fulfillment</h3>
                            <p>Most importantly, you will experience the joy and satisfaction of knowing that you are making a positive difference in {"someone\'s"} life.</p>
                        </div>
                    </div>
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
