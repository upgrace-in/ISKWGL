import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react'; 
import "../app/AnnaDaan/foodforlife.css";
import { FiCopy, FiCheck } from "react-icons/fi";

import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css'; 
import '@fontsource/open-sans/700.css'; 

export default function DirectDonation() {
    const [copiedItem, setCopiedItem] = useState(null);

    const copyText = (text, key) => {
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
        { label: "UPI ID", value: "donate.iskcon@icici" }
    ];

    return(
        <>
            <div className="donation-card-wrapper">
                <h2 style={{ color:"#d4a054", textAlign: "center", marginBottom: "30px", fontWeight: "600" }}>
                    Alternate Donation Methods
                </h2>
                
                <div style={{ display: "flex", flexDirection: "row", gap: "30px", flexWrap: "wrap", justifyContent: "center" }}>
                    
                    {/* --- NEFT / RTGS Card --- */}
                    <div style={{ 
                        flex: "1", 
                        minWidth: "280px", 
                        padding: "30px", 
                        backgroundColor: "#fcfcfc", 
                        borderRadius: "12px", 
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                    }}>
                        <h3 style={{ color:"#d4a054", textAlign: "center", marginBottom: "25px" }}>
                            Donate Via NEFT / RTGS
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            {bank_details.map((item, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "1.1rem", color: "#444" }}>
                                    <span>
                                        <strong>{item.label} : </strong>{item.value}
                                    </span>
                                    <span
                                        style={{ cursor: "pointer", color: "#888", display: "flex", alignItems: "center", padding: "5px" }}
                                        onClick={() => copyText(item.value, `bank-${index}`)}
                                        title="Copy to clipboard"
                                    >
                                        {copiedItem === `bank-${index}` ? <FiCheck color="green" size={20} /> : <FiCopy size={18} />}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- UPI ID Card --- */}
                    <div style={{ 
                        flex: "1", 
                        minWidth: "280px", 
                        padding: "30px", 
                        backgroundColor: "#fcfcfc", 
                        borderRadius: "12px", 
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        <h3 style={{ color:"#d4a054", textAlign: "center", marginBottom: "25px" }}>
                            Donate Using UPI ID
                        </h3>
                        <img 
                            src="/donateForIMGs/qrCode.jpg" 
                            alt="Scan to donate via UPI"
                            style={{ height: "200px", width: "200px", objectFit: "contain", marginBottom: "20px", borderRadius: "8px", border: "1px solid #eaeaea", padding: "10px", backgroundColor: "#fff" }}
                        />
                        <div style={{ width: "100%" }}>
                            {upiid_details.map((item, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "1.1rem", color: "#444" }}>
                                    <span>
                                        <strong>{item.label} : </strong>{item.value}
                                    </span>
                                    <span
                                        style={{ cursor: "pointer", color: "#888", display: "flex", alignItems: "center", padding: "5px" }}
                                        onClick={() => copyText(item.value, `upi-${index}`)}
                                        title="Copy to clipboard"
                                    >
                                        {copiedItem === `upi-${index}` ? <FiCheck color="green" size={20} /> : <FiCopy size={18} />}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- 80G Certificate Info --- */}
            <div className="G80-certificate-info" style={{ color: '#666', maxWidth: "1500px", margin: "0 auto 60px", padding: "0 20px", textAlign: "center" }}>
                <h3 style={{ color: "#333", marginBottom: "15px" }}>80G / 10BE Certificate of Your Donation</h3>
                {/* <p>80G certificate is available as per Income Tax Act 1961 and rules made there under.</p>

                <p>Tax Exemption Certificate Ref. No.: AAATI0017PF20219 dated 24/09/2021 valid upto 31/03/2026</p> */}
                <p style={{ marginBottom: "10px" }}>To get the receipt of the donation, please provide your full details in the donation form.</p>
                <p style={{ marginBottom: "10px" }}>
                    Or if you have used direct bank details or UPI methods, please share your <b>legal name, postal address</b> with pincode, and <b>PAN</b> along with <b>transaction details</b> on <span style={{ color:"#2c7a8b", fontWeight: "bold" }}><a target="_blank" rel="noreferrer" href="https://wa.me/+919121630614" style={{ textDecoration: "none", color: "inherit" }}>+919121630614</a></span> or <span style={{ color:"#2c7a8b", fontWeight: "bold" }}><a target="_blank" rel="noreferrer" href="mailto:warangaliskcon@gmail.com" style={{ textDecoration: "none", color: "inherit" }}>warangaliskcon@gmail.com</a></span>.
                </p>
                <p>For more information please call/WhatsApp on <span style={{ color:"#2c7a8b", fontWeight: "bold" }}><a target="_blank" rel="noreferrer" href="https://wa.me/+919121630614" style={{ textDecoration: "none", color: "inherit" }}>+919121630614</a></span>.</p>
            </div>
        </>
    );
}