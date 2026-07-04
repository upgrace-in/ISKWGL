'use client'
import React, { useState, useEffect } from 'react';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import { useRouter } from "next/navigation"
import HandlePayment from "@/Helpers/HandlePayment"
import './checkout.css';
import { useDonation } from "@/Helpers/DonationContext";
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import statesDistrictsDB from '../../Components/states_districts_db.json';
import axios from 'axios';


export default function DonationCheckout() {
    const { donationData } = useDonation();
    
    const router = useRouter()
    const [data, setData] = useState()
    const [navOpen, setNavOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', pan: '', dob: '',
        flatNo: '', street: '', landmark: '', pin: '', city: '', state: '', district: '', memoryOfSomeoneName:''
    });
    
    const indianStates = Object.keys(statesDistrictsDB).sort();
    const [districtOptions, setDistrictOptions] = useState([]);
    const [postalAreas, setPostalAreas] = useState([]);
    const [isLoadingPin, setIsLoadingPin] = useState(false);
    const [pinError, setPinError] = useState('');

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

    // Watch state to populate districts
    useEffect(() => {
        if (formData.state && statesDistrictsDB[formData.state]) {
            setDistrictOptions(statesDistrictsDB[formData.state]);
        } else {
            setDistrictOptions([]);
        }
    }, [formData.state]);

    const triggerPincodeLookup = async (pin) => {
        if (pin.length !== 6) return;
        setIsLoadingPin(true);
        setPinError(''); // Clear previous errors
        
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await res.json();

            if (data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
                const locList = data[0].PostOffice;
                const fetchedState = locList[0].State;
                const fetchedDistrict = locList[0].District;
                
                const areas = [...new Set(locList.map(po => po.Name))];
                setPostalAreas(areas);

                const selectedCity = areas[0] || '';

                setFormData(prev => ({
                    ...prev,
                    pin: pin,
                    state: fetchedState,
                    district: fetchedDistrict,
                    city: selectedCity
                }));
            } else {
                setPinError("Invalid Pincode. Please check and try again.");
                setPostalAreas([]);
                setFormData(prev => ({
                    ...prev,
                    state: '',
                    district: '',
                    city: ''
                }));
            }
        } catch (err) {
            console.error('Failed to resolve pin code via external network.');
            setPinError('Could not verify pincode. Check network.');
        } finally {
            setIsLoadingPin(false);
        }
    };

    const handlePinChange = (e) => {
        setPinError('');
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pin: val }));
        if (val.length === 6) triggerPincodeLookup(val);
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
    const checkdob = async (dict, propertyName) => {
        if (propertyName === 'dob') {
            const selectedDate = new Date(dict[propertyName])
            const currentDate = new Date()
            console.log(selectedDate, currentDate)
            if (selectedDate > currentDate)
                throw { error: "Invalid DOB!" }
        }
    }

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true);
        let finalData = {}
        // combining maultiple parts of address to make one final
        const addressParts = [
            formData.flatNo, 
            formData.street, 
            formData.landmark, 
            formData.district,
            formData.city, 
            formData.state
        ].filter(part => part && part.trim() !== "");
        const completeAddress = `${addressParts.join(', ')}`

        // making final data to be parsed to server
        const submissionData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            pan: formData.pan,
            address: completeAddress, // The combined variable
            pin: formData.pin,
            amount: donationData.amount, // From your Context
            donationType: donationData.reason,
            seva: donationData.seva,
            memoryOfSomeoneName: formData.memoryOfSomeoneName,
            fulladdress: addressParts
        };
        console.log("Passing this to the final function:", submissionData);
        Object.entries(submissionData).forEach(([property, value]) => {
            finalData[property] = value;
        });

        try {
            if (!parseFloat(finalData['amount']) > 0) throw { error: "Invalid Amount !!!" }
            await checkdob(finalData, 'dob').catch(e => { throw e })

            // ALL INPUTS are correct... Start showing progress
            let intern = setInterval(() => {
                increaseDots()
            }, 500)
            // save the data with an orderID
            const donationdata = await axios.post(`/api/createDonation/`, finalData)
            finalData['orderId'] = donationdata.data.orderId
            const response = await axios.post(`/api/createOrder/`, finalData)
            clearInterval(intern)
            if (response?.status !== 200) throw { error: "Unable to save data, please try again later !!!" }

            // pass the orderID with data to HandlePayment
            setData(response.data)

        } catch (e) {
            setStatus({ ...e, default: false })
        } finally {
            setIsLoading(false);
        }
        // const submissiData = {} // Replace with actual order ID from your backend
        // const response = await fetch('/api/payment_testing', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(submissionData) // Send the data to your server
        // });
        // const data1 = await response.json();

        // if (response.ok) {
        //     console.log("Success! Bank says:", data1);
            
        //     // 1. Extract the transaction context/token from the bank's response.
        //     // NOTE: Check your terminal logs to see exactly what ICICI calls this field! 
        //     // It might be data.tranCtx, data.token, data.transactionId, etc.
        //     const tranCtx = data1.tranCtx || "abcd"; 
            
        //     // 2. Construct the redirect URL
        //     const redirectUrl = `https://pgpayuat.icici.bank.in/tsp/pg/api/v2/authRedirect?tranCtx=${tranCtx}`;

        //     // 3. Redirect the user to the ICICI payment page!
        //     // Using window.location.href physically navigates the browser away from your site to the bank
        //     window.location.href = redirectUrl;
            
        // } else {
        //     console.error("Payment failed to initiate:", data);
        //     setStatus({ message: "Payment initialization failed", disabled: false });
        // }
        
    }

    return (
        <>
        {/* <Header handleNav={() => setNavOpen(!navOpen)} />
        <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} /> */}
        <HandlePayment data={data} />
        <div className="checkout-page">
            <div className="checkout-container">
                
                {/* Left Side: Summary & Image */}
                <div className="summary-section" style={{ backgroundImage: `url('/assets/k1.jpeg')` }}>
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
                        <div className="form-row">
                            <input type="tel" name="phone" placeholder="Mobile Number" onChange={handlePhoneChange} required />
                            <input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} required className="date-input"/>
                        </div>

                        <div className="form-group-title">2. Tax Benefits (80G)</div>
                        <input type="text" name="pan" placeholder="PAN Number" className="pan-input" onChange={handleChange} />

                        <div className="form-group-title">3. Detailed Address *</div>
                        <div className="form-row">
                            <input type="text" name="flatNo" placeholder="Flat/Door No." onChange={handleChange} required/>
                            <input type="text" name="street" placeholder="Building/Society" onChange={handleChange} required/>
                        </div>
                        <input type="text" name="landmark" placeholder="Road/Area/Landmark" onChange={handleChange} required/>
                        <div className="form-row">
                            <div className="pincode-wrapper">
                                <input type="text" name="pin" maxLength="6" value={formData.pin} onChange={handlePinChange} placeholder="Pincode" required />
                                {isLoadingPin && (
                                    <span className="pincode-loading">...</span>
                                )}
                                {pinError && <div className="pincode-error">{pinError}</div>}
                            </div>
                            <select name="state" value={formData.state} onChange={handleChange} required>
                                <option value="">Select State</option>
                                {indianStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.state} required>
                                <option value="">{formData.state ? "Select District" : "Select a state first"}</option>
                                {districtOptions.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            <select name="city" value={formData.city} onChange={handleChange} disabled={postalAreas.length === 0} required>
                                <option value="">{formData.pin.length === 6 ? "Select Postal Area" : "Enter pincode first"}</option>
                                {postalAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className='maemorystatus'>
                                <input type="checkbox" onChange={() => setMemoryStatus(old => !old ? true : false)} id="memoryOfSomeone" />
                                <label htmlFor="memoryOfSomeone">This Donation in the
                                    memory/honor of someone or performed on a specific occasion</label>
                            </div>

                            {
                                memoryStatus
                                    ?
                                    <input type="text" name="memoryOfSomeoneName" placeholder="Name" onChange={handleChange} required/>
                                    : ""
                            }
                        </div>

                        <button type="submit" className="final-donate-btn" disabled={isLoading}>
                            {isLoading ? (
                                // 3. Render the rotating dots when loading
                                <div className="dot-spinner">
                                    <div className="dot dot-1"></div>
                                    <div className="dot dot-2"></div>
                                    <div className="dot dot-3"></div>
                                </div>
                            ) : (
                                "COMPLETE DONATION & GET 80G RECEIPT"
                            )}
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