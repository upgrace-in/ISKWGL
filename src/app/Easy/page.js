'use client'
import React, { useState, useEffect } from 'react';
import statesDistrictsDB from '../../Components/states_districts_db.json';
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import { useDonateTest } from "@/Helpers/PaymentPageHandler-copy";
import { useRouter } from "next/navigation"

export default function DonationEntryForm() {
    const router = useRouter()
    const { handleDonateClick } = useDonateTest();
    const [formData, setFormData] = useState({
        donationDate: '', 
        phone: '',
        name: '',
        dob: '',
        amount: '',
        pan: '',
        email: '',
        seva: 'Easy',
        receiptNo: '',
        source: 'Website',
        addressLine1: '',
        addressLine2: '',
        pinCode: '506002',
        city: '',     // Specific Post Office / Postal Area
        district: '', // District
        state: '',
        country: 'India'
    });

    const indianStates = Object.keys(statesDistrictsDB).sort();
    const [districtOptions, setDistrictOptions] = useState([]);
    const [postalAreas, setPostalAreas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPin, setIsLoadingPin] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [popupMessage, setPopupMessage] = useState({ text: '', type: '' });

    // Initialize "Donation Date" to today's date on component mount
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, donationDate: today }));
    }, []);

    // Watch state to populate districts
    useEffect(() => {
        if (formData.state && statesDistrictsDB[formData.state]) {
            setDistrictOptions(statesDistrictsDB[formData.state]);
        } else {
            setDistrictOptions([]);
        }
    }, [formData.state]);


    // 3. Reverse Geocode Pincode via India Post API
    // Added 'savedCity' parameter to allow setting a specific city from the database after fetching
    const triggerPincodeLookup = async (pin, savedCity = null) => {
        if (pin.length !== 6) return;
        setIsLoadingPin(true);
        setMessage({ text: '', type: '' });
        
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await res.json();

            if (data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
                const locList = data[0].PostOffice;
                const fetchedState = locList[0].State;
                const fetchedDistrict = locList[0].District;
                
                // Extract unique Post Office names to populate the Postal Area / City dropdown
                const areas = [...new Set(locList.map(po => po.Name))];
                setPostalAreas(areas);

                // If a savedCity was passed from the DB, use it. Otherwise, default to the first area found.
                const selectedCity = savedCity ? savedCity : (areas[0] || '');

                setFormData(prev => ({
                    ...prev,
                    pinCode: pin, // Ensure pinCode is set
                    state: fetchedState,
                    district: fetchedDistrict,
                    city: selectedCity
                }));
            } else {
                setMessage({ text: 'Pin Code valid but regional postal details could not be resolved.', type: 'warning' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to resolve pin code via external network.', type: 'error' });
        } finally {
            setIsLoadingPin(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePinChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pinCode: val }));
        if (val.length === 6) triggerPincodeLookup(val); // No savedCity passed during manual typing
    };


    const resetFormDefaults = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({ 
            donationDate: today, phone: '', name: '', dob: '', amount: '', pan: '', email: '', seva: 'Easy', receiptNo: '', source: 'Website',
            addressLine1: '', addressLine2: '', city: '', district: '', state: '', pinCode: '', country: 'India' 
        });
        setPostalAreas([]);
        setDistrictOptions([]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        let finalData = {}
        const completeAddress = `${formData.addressLine1}, ${formData.addressLine2}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pinCode}`
        const address_split = {
            "addressLine1" : formData.addressLine1,
            "addressLine2" : formData.addressLine2,
            "pinCode" : formData.pinCode,
            "city" : formData.city,
            "district" : formData.district,
            "state": formData.state
        }
        const submissionData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            pan: formData.pan,
            address: completeAddress, // The combined variable
            pin: formData.pinCode,
            amount: formData.amount, // From your Context
            donationType: formData.reason,
            seva: formData.seva,
            fulladdress: address_split
        };
        console.log("Passing this to the final function:", submissionData);

        Object.entries(submissionData).forEach(([property, value]) => {
            finalData[property] = value;
        });

        try {
            await checkdob(finalData, 'dob').catch(e => { throw e })

            // ALL INPUTS are correct... Start showing progress
            // let intern = setInterval(() => {
            //     increaseDots()
            // }, 500)
            // save the data with an orderID
            console.log("Saving donation data to the database with orderId...");
            const donationdata = await axios.post(`/api/createDonation/`, finalData)
            finalData['orderId'] = donationdata.data.orderId
            console.log("Donation data saved with orderId:", donationdata.data.orderId);
            const response = await fetch('/api/payment_testing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalData) // Send the data to your server
            });
            const data1 = await response.json();

            if (response.ok) {
                console.log("Success! Bank says:", data1);
                
                // 1. Extract the transaction context/token from the bank's response.
                // NOTE: Check your terminal logs to see exactly what ICICI calls this field! 
                // It might be data.tranCtx, data.token, data.transactionId, etc.
                const tranCtx = data1.tranCtx || "abcd"; 
                
                // 2. Construct the redirect URL
                const redirectUrl = `https://pgpay.icici.bank.in/pg/api/v2/authRedirect?tranCtx=${tranCtx}`;

                // 3. Redirect the user to the ICICI payment page!
                // Using window.location.href physically navigates the browser away from your site to the bank
                window.location.href = redirectUrl;
                
            } else {
                console.error("Payment failed to initiate:", data1);
                setStatus({ message: "Payment initialization failed", disabled: false });
            }

        } catch (e) {
            
        } finally {
            setIsSubmitting(false);
        }







        // setMessage({ text: '', type: '' });

        // try {
        //     const response = await fetch('/api/dashboard/create_donation_entry', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(formData)
        //     });

        //     const data = await response.json();

        //     if (response.ok) {
        //         // --- NEW: EXCEL QUEUE LOGIC ON SUBMIT ---
        //         if (currentExcelIndex >= 0) {
        //             if (currentExcelIndex < excelQueue.length - 1) {
        //                 // Advance to next row
        //                 setCurrentExcelIndex(prev => prev + 1);
        //                 setPopupMessage({ text: `Saved! Loading Record ${currentExcelIndex + 2} of ${excelQueue.length}...`, type: 'success' });
        //             } else {
        //                 // Reached the end
        //                 setCurrentExcelIndex(-1);
        //                 setExcelQueue([]);
        //                 setPopupMessage({ text: 'All Excel records processed successfully!', type: 'success' });
        //                 resetFormDefaults();
        //             }
        //         } else {
        //             // Normal single entry logic
        //             setPopupMessage({ text: 'Contribution successfully recorded!', type: 'success' });
        //             resetFormDefaults();
        //         }
        //     } else {
        //         setPopupMessage({ text: data.message || 'Failed to save entry.', type: 'error' });
        //     }
        // } catch (err) {
        //     setPopupMessage({ text: 'Network error. Please try again.', type: 'error' });
        // } finally {
        //     setIsSubmitting(false);
        // }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);
    //     setMessage({ text: '', type: '' });

    //     try {
    //         const response = await fetch('/api/dashboard/create_donation_entry', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(formData)
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             setPopupMessage({ text: 'Contribution successfully recorded!', type: 'success' });
    //             const today = new Date().toISOString().split('T')[0];
    //             setFormData({
    //                 donationDate: today, phone: '', name: '', dob: '', amount: '', pan: '', email: '', receiptNo: '',
    //                 addressLine1: '', addressLine2: '', city: '', district: '', state: '', pinCode: '', country: 'India'
    //             });
    //             setPostalAreas([]);
    //             setDistrictOptions([]);
    //         } else {
    //             setPopupMessage({ text: data.message || 'Failed to save entry.', type: 'error' });
    //         }
    //     } catch (err) {
    //         setPopupMessage({ text: 'Network error. Please try again.', type: 'error' });
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const onlyDigits = value.replace(/\D/g, '');
        if (onlyDigits.length <= 10) {
            setFormData(prev => ({ ...prev, phone: onlyDigits }));
            if (onlyDigits.length === 10) {
                setMessage({ text: '', type: '' });
            }
        }
    };

    // --- SEARCH DATABASE BY PHONE ---
    const [isSearchingPhone, setIsSearchingPhone] = useState(false);

    const handlePhoneBlur = async (e) => {
        const phoneVal = e.target.value;

        if (phoneVal.length === 0) return;
        if (phoneVal.length < 10) {
            setMessage({ text: 'Mobile number must be exactly 10 digits.', type: 'error' });
            return;
        }

        setIsSearchingPhone(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch(`/api/dashboard/donors/search?phone=${phoneVal}`);
            const data = await res.json();

            if (data.success && data.donor) {
                const existing = data.donor;
                console.log("Existing donor found:", existing);
                
                // 1. Update basic fields that don't rely on APIs first
                setFormData(prev => ({
                    ...prev,
                    name: existing.name || '',
                    dob: existing.dob ? existing.dob.split('T')[0] : '', 
                    pan: existing.pan || '',
                    email: existing.email || '',
                    addressLine1: existing.address?.addressLine1 || '',
                    addressLine2: existing.address?.addressLine2 || ''
                }));

                setMessage({ text: 'Existing donor record found and loaded!', type: 'success' });

                // 2. Safely trigger Pincode lookup, passing the DB city so it gets selected AFTER the areas load
                if (existing.address?.pinCode) {
                    await triggerPincodeLookup(existing.address.pinCode, existing.address.city);
                } else {
                    // Fallback if they have state/district/city but somehow lack a pincode
                    setFormData(prev => ({
                        ...prev,
                        state: existing.address?.state || '',
                        district: existing.address?.district || '',
                        city: existing.address?.city || ''
                    }));
                }
            }
        } catch (err) {
            console.error("Error searching donor profile", err);
            setMessage({ text: 'Network error while searching donor profile.', type: 'error' });
        } finally {
            setIsSearchingPhone(false);
        }
    };
    
    const [navOpen, setNavOpen] = useState(false)

    return (
        <>
        <Header handleNav={() => setNavOpen(!navOpen)} />
        <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
        <div className="mt-[70px] md:mt-[100px] bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm w-full max-w-4xl mx-auto mt-6 sm:mt-12 box-border">
            {/* --- SUBMISSION STATUS POPUP --- */}
            {popupMessage.text && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all">
                        <div className={`flex items-center justify-center mx-auto rounded-full h-12 w-12 ${popupMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {popupMessage.type === 'success' ? (
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mt-4">
                            {popupMessage.type === 'success' ? 'Success' : 'Error'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 text-center break-words">
                            {popupMessage.text}
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button 
                                onClick={() => setPopupMessage({ text: '', type: '' })} 
                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {message.text && (
                <div className={`p-4 mb-5 rounded-md text-sm font-medium border break-words ${
                    message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 
                    message.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handlePhoneChange} 
                                onBlur={handlePhoneBlur} 
                                required 
                                placeholder="10-digit mobile number" 
                                className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                            {isSearchingPhone && (
                                <span className="absolute right-3 top-3 text-xs text-blue-600 animate-pulse bg-gray-50 px-1">Checking DB...</span>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Donor name" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px]" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹) *</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} required placeholder="e.g. 501" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">PAN Card</label>
                        <input type="text" name="pan" value={formData.pan} onChange={handleChange} placeholder="PAN number" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none uppercase focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email address" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-sm font-bold text-gray-700">Address Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Address Line 1</label>
                            <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="House No, Street, Area" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Address Line 2</label>
                            <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Landmark, Society" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        {/* Pin Code triggers Auto-fill */}
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Pin Code (Auto-fills address)</label>
                            <input type="text" name="pinCode" maxLength={6} value={formData.pinCode} onChange={handlePinChange} placeholder="Pin Code" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            {isLoadingPin && (
                                <span className="absolute right-3 top-7 text-xs text-blue-600 animate-pulse bg-gray-50 px-1">Resolving...</span>
                            )}
                        </div>

                        {/* State Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                            <select name="state" value={formData.state} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 truncate">
                                <option value="">Select State</option>
                                {indianStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* District Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">District</label>
                            <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.state} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 truncate">
                                <option value="">{formData.state ? "Select District" : "Select a state first"}</option>
                                {districtOptions.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Specific City/Postal Area */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">City / Postal Area</label>
                            <select name="city" value={formData.city} onChange={handleChange} disabled={postalAreas.length === 0} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 truncate">
                                <option value="">{formData.district ? "Select Postal Area" : "Select a district first"}</option>
                                {postalAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end pt-4 gap-3">
                    <button 
                        type="button" 
                        onClick={() => setFormData({ phone: '', name: '', dob: '', amount: '', pan: '', email: '', seva: 'Easy', receiptNo: '', source: 'Website', addressLine1: '', addressLine2: '', city: 'Warangal', district: 'Warangal', state: 'Telangana', pinCode: '506002', country: 'India' })}
                        className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Reset Defaults
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Donate'}
                    </button>
                </div>
            </form>
        </div>

        <Floating />
        
        <Foooter />
        </>
    );
}