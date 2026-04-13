import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react'; // Using lucide-react for icons

function FooterLink({ href, children }) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <a 
      target="_blank" 
      href={href} 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)} 
      style={{
        color: hovered ? "#1a738a" : "Black", 
        textDecoration: "none",
        transition: "color 0.2s ease",
        display: "inline-block",
        marginBottom: "8px",
        // marginLeft: "10px",
      }}
    >
      {children}
    </a>
  );
}

export default function Foooter() {
    const [isHovered, setIsHovered] = React.useState(false);
    return (
      <footer className="w-full font-sans text-gray-800 border-t border-gray-200">
        {/* Main Footer Content */}
        <div className="bg-[#f8f9fa] py-10 px-6 md:px-16" >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start" style={{display:"flex", flexDirection:"row", gap: "20px", flexWrap: "wrap", maxWidth: "1200px", margin: "20px auto", padding: "0 40px"}}>
            
            {/* Left Column: Important Links */}
            <div className="flex flex-col items-start md:items-start" style={{flex:"1", textAlign:"center"}}>
                <h3 style={{color:"#d4a054"}}>Important Link</h3>
                <FooterLink href="/extras/PrivacyPolicy.html">— Privacy Policy</FooterLink><br/>
                <FooterLink href="/extras/TermsAndConditions.html">— Terms & Condition</FooterLink><br/>
                <FooterLink href="/extras/RefundPolicy.html">— Refund & Cancellation</FooterLink>
                </div>
  
            {/* Center Column: Logo */}
            <div className="flex flex-col items-center justify-center" style={{flex:"1"}}>
              <img 
                src="/assets/iskcon_logo.png" 
                alt="ISKCON Warangal Logo" 
                className="h-32 object-contain"
                style={{ width:"150px", marginLeft:"100px"}}
              />
            </div>
  
            {/* Right Column: Contacts */}
            <div className="flex flex-col" style={{flex:"1"}}>
              <h3 style={{color:"#d4a054", textAlign:"center"}}>Contacts</h3>
              <div className="space-y-4 text-sm md:text-base" style={{marginLeft:"20px"}}>
                <div className="flex items-center gap-3 border-b border-gray-300 pb-2">
                  <Mail className="text-[#1a738a] w-5 h-5" style={{marginRight:"10px"}}/>
                  <FooterLink href="mailto:warangaliskcon@gmail.com">warangaliskcon@gmail.com</FooterLink>
                </div>
                <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                  <Phone className="text-[#1a738a] w-5 h-5" style={{marginRight:"10px"}}/>
                  <FooterLink href="https://wa.me/+919121630614">+919121630614</FooterLink>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#1a738a] w-6 h-6 mt-1 flex-shrink-0" />
                  <span className="leading-relaxed" style={{marginLeft:"10px"}}><a target="_blank" href="https://maps.app.goo.gl/pCYGwBeL9qbxCarM7" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{color: isHovered ? "#1a738a" : "Black", textDecoration: "none",transition: "color 0.2s ease"}}>
                    ISKCON Temple, Sri Sri Radha NilMadhava mandir, ISKCON Warangal,
                    Beside Vajra Gardens, Mulugu Road Paidipally, Warangal,
                    Telangana 506007</a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Bottom Bar: Copyright */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-medium" style={{textAlign:"center"}}>
          <p class="mt-2 mb-0">
              © 2024 ISKCON-WARANGAL
              <span class="d-inline-block mx-2">|</span> All Rights
              Reserved.
          </p>
        </div>
      </footer>
    )
}