'use client'
import $ from "jquery";
import { 
    FaHeart, 
    FaFacebookF, 
    FaYoutube, 
    FaInstagram, 
    FaBars, 
    FaHandsHelping 
} from 'react-icons/fa'; 
import { 
  Home, Image, Info, User, Heart, Mail, Zap, X, 
  Facebook, Twitter, Instagram 
} from 'lucide-react';

export default function SideNav({ openNav = "", handleNav = () => {} }) {
  const buttonStyle = {
      background: 'linear-gradient(135deg, #d4a054 0%, #6b2d2d 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      whiteSpace: 'nowrap',
  };
  return (
    <div class={`side-nav ${openNav}`}>
      <div class="side-nav-heading">
        <figure class="mb-0">
          <img src="/assets/iskcon_logo.png" alt="" />
        </figure>
        <div class="side-nav-left-header">
          <button style={buttonStyle}>
            <a href="/rathyatra" onClick={() => handleNav()} className="donateBTN main-list"><FaHeart /> Rath Yatra</a>
          </button>
          <button class="side-menu-close" onClick={() => handleNav()}>
            <X size={24} />
          </button>
        </div>
      </div>
      <div class="side-nav-body">
        <div class="menu-scroll-wrap">
          <ul class="list-unstyled" style={{ textAlign : "center", fontWeight: "600", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px" }} >
              <a aria-current="page" class="main-anc" href="/">
                Home
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px" }} >
              <a class="main-anc" href="/#gallery">
                Gallery
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px" }} >
              <a class="main-anc" href="/#about-us">
                About us
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px" }}  >
              <a class="main-anc" href="/#founder">
                Founder
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px" }}>
              <a class="main-anc" href="/AnnaDaan">
                Donation Options
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px" }}  >
              <a class="main-anc" href="/#contact-us">
                Contact
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px"  }}>
              <a class="main-anc" href="/#quick-donate">
                Quick Donate
              </a>
            </li>
            <li class="main-list" onClick={() => handleNav()} style={{ border: "1px solid #ddd", borderRadius: "12px"  }}>
              <a class="main-anc" href="/templerenovation" style={buttonStyle}>
                <FaHandsHelping size={18}/> Help Temple Renovate
              </a>
            </li>
            <li class="side-nav-social-links">
              <a target="_blank" href="https://facebook.com/warangaliskcon">
                <FaFacebookF size={20} />
              </a>
              <a target="_blank" href="https://www.youtube.com/@hktv108">
                <FaYoutube size={20} />
              </a>
              <a
                target="_blank"
                href="https://www.instagram.com/iskconwarangal"
              >
                <FaInstagram size={20} />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="side-nav-footer"></div>
    </div>
  );
}
