'use client'
import React, { useState } from 'react';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import { useRouter } from "next/navigation"
import HandlePayment from "@/Helpers/HandlePayment"
import './checkout.css';
import { useDonation } from "@/Helpers/DonationContext";
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import axios from 'axios';


export default function DonationCheckout() {
    const { donationData } = useDonation();
    
    const router = useRouter()
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', pan: '',
        flatNo: '', street: '', landmark: '', pin: '', city: '', state: '',memoryOfSomeoneName:''
    });
    
    const [status, setStatus] = useState({})
    const [memoryStatus, setMemoryStatus] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    // Function to handle changes and restrict phone to digits only
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // This RegEx allows only numbers and limits to 10 digits
        const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: cleanedValue });
    };
    const increaseDots = () => {
        setStatus({ message: "Processing Payment.", disabled: true })
        setTimeout(() => {
            setStatus({ message: "Processing Payment..", disabled: true })
            setTimeout(() => {
                setStatus({ message: "Processing Payment...", disabled: true })
            }, 150)
        }, 150)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        let finalData = {}
        const addressParts = [
            formData.flatNo, 
            formData.street, 
            formData.landmark, 
            formData.city, 
            formData.state
        ].filter(part => part && part.trim() !== "");
        const completeAddress = `${addressParts.join(', ')}`
        const submissionData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            pan: formData.pan,
            address: completeAddress, // The combined variable
            pin: formData.pin,
            amount: donationData.amount, // From your Context
            memoryOfSomeoneName: formData.memoryOfSomeoneName
        };
        console.log("Passing this to the final function:", submissionData);
        Object.entries(submissionData).forEach(([property, value]) => {
            finalData[property] = value;
        });
        try {
            if (!parseFloat(finalData['amount']) > 0) throw { error: "Invalid Amount !!!" }
            // ALL INPUTS are correct... Start showing progress
            let intern = setInterval(() => {
                increaseDots()
            }, 500)
            // save the data with an orderID
            const response = await axios.post(`/api/createDonation/`, finalData)
            clearInterval(intern)
            if (response?.status !== 200) throw { error: "Unable to save data, please try again later !!!" }

            // pass the orderID with data to HandlePayment
            setData(response.data)

        } catch (e) {
            setStatus({ ...e, default: false })
        }
    }

    return (
        <>
        {/* <Header handleNav={() => setNavOpen(!navOpen)} />
        <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} /> */}
        <HandlePayment data={data} />
        <div className="checkout-page">
            <div className="checkout-container">
                
                {/* Left Side: Summary & Image */}
                <div className="summary-section" style={{ backgroundImage: `url('/donateForIMGs/121.jpg')` }}>
                    <div className="summary-overlay">
                        {/* <img src="/logo.png" alt="ISKCON Logo" className="checkout-logo" /> */}
                        <div className="summary-content">
                            <p className="summary-sub">You are making a difference</p>
                            <h2 className="summary-main">Donate ₹{donationData.amount} for {donationData.reason}</h2>
                        </div>
                    </div>
                </div>

                {/* Right Side: Detailed Form */}
                <div className="form-section">
                    <h2 className="form-title">Complete Your Donation Details</h2>
                    <p className="helper-text"><b>**Please Note:</b> Complete Address with PIN-Code and PAN is mandatory for an 80G Receipt.</p>
                    
                    <form className="checkout-form" onSubmit={(e) => handleSubmit(e)}>
                        <div className="form-group-title">1. Personal Information *</div>
                        <div className="form-row">
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
                        </div>
                        <input type="tel" name="phone" placeholder="Mobile Number" onChange={handlePhoneChange} required />

                        <div className="form-group-title">2. Tax Benefits (80G)</div>
                        <input type="text" name="pan" placeholder="PAN Number" className="pan-input" onChange={handleChange} />

                        <div className="form-group-title">3. Detailed Address *</div>
                        <div className="form-row">
                            <input type="text" name="flatNo" placeholder="Flat/Door No." onChange={handleChange} />
                            <input type="text" name="street" placeholder="Building/Society" onChange={handleChange} />
                        </div>
                        <input type="text" name="landmark" placeholder="Road/Area/Landmark" onChange={handleChange} />
                        <div className="form-row">
                            <input type="text" name="pin" placeholder="Pincode" onChange={handleChange} />
                            <input type="text" name="city" placeholder="City/State" onChange={handleChange} />
                        </div>

                        <div>
                            <div className='maemorystatus'>
                                <input type="checkbox" onChange={() => setMemoryStatus(old => !old ? true : false)} id="memoryOfSomeone" />
                                <label for="memoryOfSomeone">This Donation in the
                                    memory/honor of someone or performed on a specific occasion</label>
                            </div>

                            {
                                memoryStatus
                                    ?
                                    <input type="text" name="memoryOfSomeoneName" placeholder="Name" onChange={handleChange} />
                                    : ""
                            }
                        </div>


                        <button type="submit" className="final-donate-btn">
                            COMPLETE DONATION & GET 80G RECEIPT
                        </button>
                    </form>
                </div>

            </div>
        </div>
        <Foooter />  
        <Floating /> 
        </>
    );
}