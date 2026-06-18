'use client'
import { useState, useEffect, useRef } from "react";
import SideNav from "./SideNav";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    
    // 1. Get the current URL
    const pathname = usePathname();
    // 2. Check if the user is currently on the Rath Yatra page
    const isRathYatraPage = pathname === '/rathyatra';

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
            
            {/* ==========================================
                INJECTED CSS FOR RESPONSIVE BEHAVIOR
            ========================================== */}
            <style dangerouslySetInnerHTML={{ __html: `
                .nav-rath-yatra-highlight {
                    background: linear-gradient(135deg, #d4a054, #eec48c);
                    color: #5a0209 !important;
                    padding: 10px 18px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    text-decoration: none;
                    box-shadow: 0 4px 10px rgba(212, 160, 84, 0.4);
                    animation: gentle-pulse 2s infinite;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                }
                .nav-rath-yatra-highlight:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(212, 160, 84, 0.6);
                }
                @keyframes gentle-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(212, 160, 84, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(212, 160, 84, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(212, 160, 84, 0); }
                }

                /* --- DESKTOP VS MOBILE DISPLAY LOGIC --- */
                .desktop-header-layout {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 40px;
                }
                .mobile-header-layout {
                    display: none; 
                }

                /* Mobile breakpoint */
                @media (max-width: 1199px) {
                    .desktop-header-layout {
                        display: none !important; 
                    }
                    .mobile-header-layout {
                        display: flex !important; 
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        padding: 0 20px;
                    }
                    .mobile-rath-btn {
                        padding: 8px 12px;
                        font-size: 14px;
                    }
                }
            `}} />

            {/* ==========================================
                1. DESKTOP VIEW (Completely Unchanged)
            ========================================== */}
            <div className="desktop-header-layout">
                {/* Social Icons */}
                <div style={{ display: 'flex', gap: '20px', fontSize: '20px', color: '#d4a054', flex: '1', justifyContent: 'center'}}>
                    <a target="_blank" href="https://www.facebook.com/warangaliskcon" style={{color: 'inherit'}}><FaFacebookF /></a>
                    <a target="_blank" href="https://www.youtube.com/@hktv108" style={{color: 'inherit'}}><FaYoutube /></a>
                    <a target="_blank" href="https://www.instagram.com/iskconwarangal" style={{color: 'inherit'}}><FaInstagram /></a>
                </div>

                {/* Left Nav */}
                <nav style={{ flex: '2' }}>
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '25px', justifyContent: 'center', alignItems: 'center' }}>
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
                <nav style={{ flex: '1.5' }}>
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '25px', justifyContent: 'center', alignItems: 'center' }}>
                        <li><a href="/AnnaDaan" style={navLinkStyle}>Donation Options</a></li>
                        <li><a href="/#contact-us" style={navLinkStyle}>CONTACT</a></li>
                    </ul>
                </nav>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: '2', justifyContent: 'flex-end' }}>
                    {/* <Link 
                        href="/rathyatra" 
                        className={isRathYatraPage ? "standard-nav-link" : "nav-rath-yatra-highlight"}
                    >
                        ✦ Rath Yatra
                    </Link> */}

                    {/* <button style={buttonStyle} onClick={() => window.location.href='/#donate'}>
                        <FaHeart /> Donate Now
                    </button> */}
                    <Link 
                        href="/rathyatra" 
                        className={"nav-rath-yatra-highlight mobile-rath-btn"}
                    >
                        <FaHeart style={{ marginRight: '6px' }}/> Rath Yatra
                    </Link>
                    <button style={buttonStyle} onClick={() => window.location.href='/templerenovation'}>
                        <FaHandsHelping size={18} /> Help Temple Renovate
                    </button>
                </div>
            </div>

            {/* ==========================================
                2. MOBILE VIEW (New Layout)
            ========================================== */}
            <div className="mobile-header-layout">
                {/* 1. LEFT: Logo */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-start' }}>
                    <a href="/">
                        <img src="/assets/iskcon_logo.png" alt="Logo" style={{ height: '55px', width: 'auto' }} />
                    </a>
                </div>

                {/* 2. CENTER: Rath Yatra Button */}
                {/* flex: none ensures it stays perfectly centered without being stretched */}
                <div style={{ flex: 'none', display: 'flex', justifyContent: 'center' }}>
                    <Link 
                        href="/rathyatra" 
                        className={"nav-rath-yatra-highlight mobile-rath-btn"}
                    >
                        <FaHeart style={{ marginRight: '6px' }}/> Rath Yatra
                    </Link>
                </div>

                {/* 3. RIGHT: 3 Dots / Hamburger */}
                {/* flex: 1 matches the logo side so the center item stays dead center */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleNav} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#333', cursor: 'pointer' }}>
                        <FaBars />
                    </button>
                </div>
            </div>

            {/* Slide-out Navigation */}
            <SideNav openNav={openNav} handleNav={handleNav} />
        </header>
    );
}