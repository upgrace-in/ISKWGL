import React, {useState} from 'react';
import { Mail, Phone, MapPin } from 'lucide-react'; 
import "../app/AnnaDaan/foodforlife.css"
import { FiCopy, FiCheck } from "react-icons/fi";

import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css'; // Normal weight
import '@fontsource/open-sans/700.css'; // Bold weight

export default function DirectDonation() {
    const [isHovered, setIsHovered] = React.useState(false);
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
    // Define your style objects
    const styles = {
        container: {
        display: 'flex',           // This puts items side-by-side
        flexDirection: 'row',      // Ensures horizontal alignment
        alignItems: 'center',      // Vertically centers the items
        padding: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        gap: '12px'                // Adds space between input and button
        },
        inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,               // Makes the input take up remaining space
        backgroundColor: '#F7F8F9',
        borderRadius: '8px',
        padding: '0 12px',
        height: '48px'
        },
        inputField: {
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        width: '100%',
        padding: '8px',
        fontSize: '16px',
        color: '#374151'
        },
        button: {
        padding: '0 24px',
        height: '48px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #9ca3af',
        borderRadius: '9999px',     // Creates the pill shape
        fontWeight: 'bold',
        color: '#111827',
        cursor: 'pointer',
        whiteSpace: 'nowrap'       // Keeps text on one line
        }
    };
    return(
        <>
            <div className="donation-card-wrapper">
                <h3 style={{color:"#d4a054", textAlign: "center"}}>Alternate Donation Methods</h3>
                <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" }}>
                    <div  className="donation-card-wrapper" style={{ flex: "1", minWidth: "300px", padding:"15px", margin:"10px"}}>
                        <h4 style={{color:"#d4a054", textAlign: "center"}}>Donate Via NEFT / RTGS</h4>
                        <div style={{textAlign:"center"}} >
                            {bank_details.map((item, index) => (
                                <div key={index} style={{margin:"20px"}}>
                                    <span style={{marginRight:"10px"}}>
                                        <strong>{item.label} : </strong>{item.value}
                                    </span>

                                    <span
                                        style={styles.icon}
                                        onClick={() => copyText(item.value, `bank-${index}`)}
                                    >
                                        {copiedItem === `bank-${index}` ? <FiCheck /> : <FiCopy />}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div  className="donation-card-wrapper"style={{ flex: "1", minWidth: "300px", textAlign:"center", padding:"15px", margin:"10px"}}>
                        <h4 style={{color:"#d4a054", textAlign: "center"}}>Donate Using UPI ID</h4>
                        <img 
                            src="/donateForIMGs/qrCode.jpg" /* REPLACE WITH YOUR IMAGE PATH */
                            alt="HHRNSM distributing prasadam to school children"
                            style={{height:"250px", width:"auto"}}
                        />
                        {upiid_details.map((item, index) => (
                            <div key={index} style={{margin:"10px"}}>
                                <span style={{marginRight:"10px"}}>
                                    <strong>{item.label} : </strong>{item.value}
                                </span>

                                <span
                                    style={styles.icon}
                                    onClick={() => copyText(item.value, `upi-${index}`)}
                                >
                                    {copiedItem === `upi-${index}` ? <FiCheck /> : <FiCopy />}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            

            <div className="G80-certificate-info" style={{color: '#666'}}>
                <h4>80G / 10BE Certificate of Your Donation</h4>
                <p>80G certificate is available as per Income Tax Act 1961 and rules made there under.</p>
                <p>Tax Exemption Certificate Ref. No.: AAATI0017PF20219 dated 24/09/2021 valid upto 31/03/2026</p>
                <p>To get the recipt of the donation, please provide your full details in the donation form</p>
                <p> Or if you have used directly bank details or upi methods please share your <b>legal name, postal address</b> with pincode and <b>PAN</b> along with <b>transaction details</b> on <span style={{color:"blue"}}><a target="_blank" href="https://wa.me/+919121630614">+919121630614</a></span> or <span style={{color:"blue"}}><a target="_blank" href="mailto:warangaliskcon@gmail.com">warangaliskcon@gmail.com</a></span>.</p>
                <p>For more information please call/Whatsapp on <span style={{color:"blue"}}><a target="_blank" href="https://wa.me/+919121630614">+919121630614</a></span> </p>
            </div>
        </>
    )
}