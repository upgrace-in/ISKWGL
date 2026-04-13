'use client'
import { useState, useEffect, useRef } from "react";
import SideNav from "./SideNav";
// Import all icons from 'fa' to avoid 'undefined' errors from missing sub-libraries
import { 
    FaHeart, 
    FaFacebookF, 
    FaYoutube, 
    FaInstagram, 
    FaBars, 
    FaHandsHelping 
} from 'react-icons/fa'; 

export default function Header() {
    const [openNav, setOpenNav] = useState('')
    const headerRef = useRef(null);

    const handleNav = () => setOpenNav(old => old === '' ? 'opened' : '')

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let currentTranslateY = 0;

        const controlNavbar = () => {
            const currentScrollY = window.scrollY;
            const header = headerRef.current;
            if (!header) return;
            const headerHeight = header.offsetHeight;
            const delta = currentScrollY - lastScrollY;
            currentTranslateY = Math.max(-headerHeight, Math.min(0, currentTranslateY - delta));
            if (currentScrollY <= 0) currentTranslateY = 0;
            header.style.transform = `translateY(${currentTranslateY}px)`;
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, []);

    const buttonStyle = {
        background: 'linear-gradient(135deg, #d4a054 0%, #6b2d2d 100%)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
    };

    const navLinkStyle = {
        textDecoration: 'none',
        color: '#444',
        fontWeight: '600',
        fontSize: '16px',
        whiteSpace: 'nowrap'
    };

    return (
        <header ref={headerRef} style={{ 
            position: 'fixed', width: '100%', left: 0, top: 0, zIndex: 99, 
            backgroundColor: '#fff', 
            borderBottomRightRadius: '40px', borderBottomLeftRadius: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            padding: '10px 0',
            transition: 'transform 0.3s ease'
        }}>
            <div className="container-fluid" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                maxWidth: '1440px', margin: '0 auto', padding: '0 40px' 
            }}>
                {/* Social Icons */}
                <div style={{ display: 'flex', gap: '20px', fontSize: '20px', color: '#d4a054', flex: '1', justifyContent: 'center'}}>
                    <a target="_blank" href="https://www.facebook.com/warangaliskcon" style={{color: 'inherit'}}><FaFacebookF /></a>
                    <a target="_blank" href="https://www.youtube.com/@hktv108" style={{color: 'inherit'}}><FaYoutube /></a>
                    <a target="_blank" href="https://www.instagram.com/iskconwarangal" style={{color: 'inherit'}}><FaInstagram /></a>
                </div>

                {/* Left Nav */}
                <nav className="d-none d-xl-block" style={{ flex: '2' }}>
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '25px', justifyContent: 'center' }}>
                        <li><a href="/" style={navLinkStyle}>HOME</a></li>
                        <li><a href="/#gallery" style={navLinkStyle}>GALLERY</a></li>
                        <li><a href="/#about-us" style={navLinkStyle}>ABOUT US</a></li>
                        <li><a href="/#founder" style={navLinkStyle}>FOUNDER</a></li>
                    </ul>
                </nav>

                {/* Center Logo */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                    <a href="/"><img src="/assets/iskcon_logo.png" alt="Logo" style={{ height: '80px', width: 'auto' }} /></a>
                </div>

                {/* Right Nav */}
                <nav className="d-none d-xl-block" style={{ flex: '1.5' }}>
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '25px', justifyContent: 'center' }}>
                        <li><a href="/FoodForLife" style={navLinkStyle}>Donation Options</a></li>
                        <li><a href="/#contact-us" style={navLinkStyle}>CONTACT</a></li>
                    </ul>
                </nav>

                {/* Action Buttons */}
                <div className="d-none d-xl-flex" style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: '2', justifyContent: 'flex-end' }}>
                    <button style={buttonStyle} onClick={() => window.location.href='/#donate'}>
                        <FaHeart /> Donate Now
                    </button>
                    <button style={buttonStyle} onClick={() => window.location.href='/templerenovation'}>
                        <FaHandsHelping size={18} /> Help Temple Renovate
                    </button>
                    
                </div>
                {/* 1. LEFT: Mobile Menu Toggle (Visible only on mobile/tablet) */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }} className="d-xl-none">
                    <button onClick={handleNav} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#333', cursor: 'pointer' }}>
                        <FaBars />
                    </button>
                </div>
                {/* Placeholder for Mobile Balance (keeps logo centered)
                <div className="d-xl-none" style={{ flex: '1' }}></div> */}
            </div>
            <SideNav openNav={openNav} handleNav={handleNav} />
        </header>
    );
}