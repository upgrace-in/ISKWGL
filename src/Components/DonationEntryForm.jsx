'use client'
import React, { useState, useEffect } from 'react';
import statesDistrictsDB from './states_districts_db.json';

export default function DonationEntryForm() {
    const [formData, setFormData] = useState({
        donationDate: '', 
        phone: '',
        name: '',
        dob: '',
        amount: '',
        seva: '',
        pan: '',
        email: '',
        receiptNo: '',
        addressLine1: '',
        addressLine2: '',
        pinCode: '506002',
        city: '',     // Specific Post Office / Postal Area
        district: '', // District
        state: '',
        country: 'India',
        source: 'Cash'
    });

    const indianStates = Object.keys(statesDistrictsDB).sort();
    const [districtOptions, setDistrictOptions] = useState([]);
    const [postalAreas, setPostalAreas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPin, setIsLoadingPin] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [popupMessage, setPopupMessage] = useState({ text: '', type: '' });

    const [excelQueue, setExcelQueue] = useState([]);
    const [currentExcelIndex, setCurrentExcelIndex] = useState(-1);

    const sevaOptions = [
        "Easy", "AnnaDaan", "Go Seva", "Rath Yatra", "Ekadasi", "Tula Daan", "Nithya Seva", "General Donation"
    ];

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

    useEffect(() => {
        if (currentExcelIndex >= 0 && excelQueue.length > 0) {
            const currentRow = excelQueue[currentExcelIndex];
            setFormData(prev => ({
                ...prev,
                name: currentRow.name || '',
                phone: currentRow.phone || '',
                amount: currentRow.amount || '',
                source: 'UPI',
                pan: currentRow.pan || '',
                email: currentRow.email || '',
                addressLine1: currentRow.address || '',
                receiptNo: currentRow.orderId || '',
                donationDate: currentRow.date,
                pinCode: currentRow.pin || '',
            }));
            // Optional: Trigger phone blur automatically to check DB for existing details
            // if (currentRow.phone && currentRow.phone.length === 10) {
            //    handlePhoneBlur({ target: { value: currentRow.phone } });
            // }
        }
    }, [currentExcelIndex, excelQueue]);

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

    // --- NEW: FETCH EXCEL DATA FUNCTION ---
    const fetchExcelData = async () => {
        try {
            // Adjust the API route path if it's different
            const res = await fetch('/api/FeedExistingData');
            const json = await res.json();
            
            if (json.success && json.data?.length > 0) {
                setExcelQueue(json.data);
                setCurrentExcelIndex(0);
                setMessage({ text: `Loaded ${json.data.length} records from Excel. Please review and submit Row 1.`, type: 'success' });
            } else {
                setMessage({ text: json.error || 'Failed to load data or Excel is empty.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: `Error fetching Excel data. ${error}`, type: 'error' });
        }
    };

    const resetFormDefaults = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({ 
            donationDate: today, phone: '', name: '', dob: '', amount: '', seva: '', pan: '', source: 'Cash', email: '', receiptNo: '', 
            addressLine1: '', addressLine2: '', city: '', district: '', state: '', pinCode: '', country: 'India' 
        });
        setPostalAreas([]);
        setDistrictOptions([]);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch('/api/dashboard/create_donation_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // --- NEW: EXCEL QUEUE LOGIC ON SUBMIT ---
                if (currentExcelIndex >= 0) {
                    if (currentExcelIndex < excelQueue.length - 1) {
                        // Advance to next row
                        setCurrentExcelIndex(prev => prev + 1);
                        setPopupMessage({ text: `Saved! Loading Record ${currentExcelIndex + 2} of ${excelQueue.length}...`, type: 'success' });
                    } else {
                        // Reached the end
                        setCurrentExcelIndex(-1);
                        setExcelQueue([]);
                        setPopupMessage({ text: 'All Excel records processed successfully!', type: 'success' });
                        resetFormDefaults();
                    }
                } else {
                    // Normal single entry logic
                    setPopupMessage({ text: 'Contribution successfully recorded!', type: 'success' });
                    resetFormDefaults();
                }
            } else {
                setPopupMessage({ text: data.message || 'Failed to save entry.', type: 'error' });
            }
        } catch (err) {
            setPopupMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
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
    //                 donationDate: today, phone: '', name: '', dob: '', amount: '', seva: '', pan: '', source: 'Cash', email: '', receiptNo: '',
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

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
            {/* --- SUBMISSION STATUS POPUP --- */}
            {popupMessage.text && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 transform transition-all">
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
                        <p className="text-sm text-gray-600 mt-2 text-center">
                            {popupMessage.text}
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button 
                                onClick={() => setPopupMessage({ text: '', type: '' })} 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Contribution Entry</h2>
                
                {/* --- NEW: LOAD EXCEL BUTTON --- */}
                <button 
                    onClick={fetchExcelData}
                    disabled={currentExcelIndex >= 0}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                    Load from Excel
                </button>
            </div>

            {/* <h2 className="text-xl font-bold text-gray-900 mb-6">New Contribution Entry</h2> */}

            {/* --- NEW: QUEUE PROGRESS BANNER --- */}
            {excelQueue.length > 0 && currentExcelIndex >= 0 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-5 flex justify-between items-center">
                    <span>Processing Excel Data: Record <strong>{currentExcelIndex + 1}</strong> of <strong>{excelQueue.length}</strong></span>
                    <button 
                        type="button" 
                        onClick={() => { setExcelQueue([]); setCurrentExcelIndex(-1); resetFormDefaults(); }} 
                        className="text-xs bg-white border border-blue-300 px-3 py-1 rounded hover:bg-blue-100 font-medium"
                    >
                        Cancel Bulk Mode
                    </button>
                </div>
            )}
            
            {message.text && (
                <div className={`p-4 mb-5 rounded-md text-sm font-medium border ${
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
                                onBlur={handlePhoneBlur} // <-- Triggers auto-population
                                required 
                                placeholder="10-digit mobile number" 
                                className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                            {isSearchingPhone && (
                                <span className="absolute right-3 top-3 text-xs text-blue-600 animate-pulse">Checking DB...</span>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Donor name" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹) *</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} required placeholder="e.g. 501" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Seva Name *</label>
                        <select name="seva" value={formData.seva} onChange={handleChange} required className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Seva</option>
                            {sevaOptions.map(seva => (
                                <option key={seva} value={seva}>{seva}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Source *</label>
                        <select name="source" value={formData.source} onChange={handleChange} required className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Cash">Cash</option>
                            <option value="Website">Website</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">PAN Card</label>
                        <input type="text" name="pan" value={formData.pan} onChange={handleChange} placeholder="PAN number" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none uppercase focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Receipt No</label>
                        <input type="text" name="receiptNo" value={formData.receiptNo} onChange={handleChange} placeholder="Receipt number" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-sm font-bold text-gray-700">Address Details</h3>
                        <div className="flex items-center space-x-3">
                            <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Date of Donation *</label>
                            <input 
                                type="date" 
                                name="donationDate" 
                                value={formData.donationDate} 
                                onChange={handleChange} 
                                required 
                                className="border border-gray-300 p-2 rounded-lg bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto" 
                            />
                        </div>
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
                            <input type="text" name="pinCode" maxLength="6" value={formData.pinCode} onChange={handlePinChange} placeholder="Pin Code" className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            {isLoadingPin && (
                                <span className="absolute right-3 top-7 text-xs text-blue-600 animate-pulse">Resolving...</span>
                            )}
                        </div>

                        {/* State Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                            <select name="state" value={formData.state} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select State</option>
                                {indianStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* District Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">District</label>
                            <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.state} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                                <option value="">{formData.state ? "Select District" : "Select a state first"}</option>
                                {districtOptions.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Specific City/Postal Area (Populated via Pin/District POs) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">City / Postal Area</label>
                            <select name="city" value={formData.city} onChange={handleChange} disabled={postalAreas.length === 0} className="border border-gray-300 p-2.5 rounded-lg w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                                <option value="">{formData.district ? "Select Postal Area" : "Select a district first"}</option>
                                {postalAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                    <button 
                        type="button" 
                        onClick={() => setFormData({ phone: '', name: '', dob: '', amount: '', seva: '', pan: '', source: 'Cash', email: '', receiptNo: '', addressLine1: '', addressLine2: '', city: 'Warangal', district: 'Warangal', state: 'Telangana', pinCode: '506002', country: 'India' })}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Reset Defaults
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Submit Contribution'}
                    </button>
                </div>
            </form>
        </div>
    );
}