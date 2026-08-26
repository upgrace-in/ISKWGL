"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import statesDistrictsDB from '@/Components/states_districts_db.json';

export default function DonorProfile() {
    const params = useParams();
    const phoneParam = params?.phone;

    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        email: "",
        pan: "",
        dob: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        district: "",
        state: "",
        pinCode: ""
    });

    // Transaction Inline Edit States
    const [editingTxId, setEditingTxId] = useState(null);
    const [txForm, setTxForm] = useState({
        name: "",
        orderId: "",
        donationDate: "",
        seva: "",
        amount: "",
        source: ""
    });

    // State for Delete Modal
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Extract list of states safely from JSON irrespective of schema structure
    const statesList = useMemo(() => {
        if (Array.isArray(statesDistrictsDB)) {
            return statesDistrictsDB.map(s => typeof s === 'string' ? s : s.state || s.name);
        }
        if (statesDistrictsDB?.states && Array.isArray(statesDistrictsDB.states)) {
            return statesDistrictsDB.states.map(s => typeof s === 'string' ? s : s.state || s.name);
        }
        return Object.keys(statesDistrictsDB || {});
    }, []);

    // Get districts based on selected state
    const districtsList = useMemo(() => {
        if (!editForm.state || !statesDistrictsDB) return [];
        
        if (Array.isArray(statesDistrictsDB)) {
            const found = statesDistrictsDB.find(s => (s.state || s.name) === editForm.state);
            return found?.districts || [];
        }
        if (statesDistrictsDB?.states && Array.isArray(statesDistrictsDB.states)) {
            const found = statesDistrictsDB.states.find(s => (s.state || s.name) === editForm.state);
            return found?.districts || [];
        }
        return statesDistrictsDB[editForm.state] || [];
    }, [editForm.state]);

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch {
            return "";
        }
    };

    useEffect(() => {
        if (!phoneParam) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/dashboard/donors/${phoneParam}`);
                const result = await res.json();
                
                if (result.success) {
                    setProfile(result.personalInfo);
                    setHistory(result.donations || []);
                    populateEditForm(result.personalInfo);
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [phoneParam]);

    const populateEditForm = (donorData) => {
        setEditForm({
            email: donorData?.email || "",
            pan: donorData?.pan || "",
            dob: formatDateForInput(donorData?.dob),
            addressLine1: donorData?.address?.addressLine1 || "",
            addressLine2: donorData?.address?.addressLine2 || "",
            city: donorData?.address?.city || "",
            district: donorData?.address?.district || "",
            state: donorData?.address?.state || "",
            pinCode: donorData?.address?.pinCode || ""
        });
    };

    // 1. Add state for available cities/areas
    const [citiesList, setCitiesList] = useState([]);

    // 2. Combine PIN lookup results with any existing saved city value
    const cityOptions = useMemo(() => {
        const options = new Set(citiesList);
        if (editForm.city) options.add(editForm.city);
        return Array.from(options);
    }, [citiesList, editForm.city]);

    // 1. Add PIN Lookup Helper Function inside DonorProfile component
    const fetchAddressByPin = async (pin) => {
        if (pin.length === 6 && /^\d+$/.test(pin)) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();

                if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
                    const postOffices = data[0].PostOffice;
                    const firstPO = postOffices[0];

                    // Extract all unique office/locality names under this PIN code
                    const fetchedCities = Array.from(
                        new Set(postOffices.map((po) => po.Name).filter(Boolean))
                    );

                setCitiesList(fetchedCities);
                    
                    setEditForm((prev) => ({
                        ...prev,
                        state: firstPO.State || prev.state,
                        district: firstPO.District || prev.district,
                        city: fetchedCities[0] || prev.city // Auto-select the primary city/area
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch location by PIN Code:", error);
            }
        }
    };

    // 2. Update handleInputChange to trigger PIN lookup automatically
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => {
            const updated = { 
                ...prev, 
                [name]: name === "pan" ? value.toUpperCase() : value 
            };
            
            if (name === "state") {
                updated.district = ""; // Reset district when state manually changes
            }
            
            return updated;
        });

        // Trigger lookup when PIN reaches 6 digits
        if (name === "pinCode") {
            fetchAddressByPin(value);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch(`/api/dashboard/donors/${phoneParam}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: editForm.email,
                    pan: editForm.pan,
                    dob: editForm.dob,
                    address: {
                        addressLine1: editForm.addressLine1,
                        addressLine2: editForm.addressLine2,
                        city: editForm.city,
                        district: editForm.district,
                        state: editForm.state,
                        pinCode: editForm.pinCode
                    }
                })
            });

            const data = await res.json();

            if (data.success) {
                setProfile((prev) => ({
                    ...prev,
                    email: editForm.email,
                    pan: editForm.pan,
                    dob: editForm.dob,
                    address: {
                        addressLine1: editForm.addressLine1,
                        addressLine2: editForm.addressLine2,
                        city: editForm.city,
                        district: editForm.district,
                        state: editForm.state,
                        pinCode: editForm.pinCode
                    }
                }));
                setIsEditing(false);
            } else {
                alert("Failed to update profile: " + data.message);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- TRANSACTION EDIT HANDLERS ---
    const startEditingTx = (record) => {
        setEditingTxId(record._id);
        setTxForm({
            name: record.name || "",
            orderId: record.orderId || "",
            donationDate: formatDateForInput(record.donationDate),
            seva: record.seva || "",
            amount: record.amount || 0,
            source: record.source || ""
        });
    };

    const cancelEditingTx = () => {
        setEditingTxId(null);
    };

    const handleSaveTx = async (txId) => {
        try {
            const res = await fetch(`/api/dashboard/transactions/${txId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(txForm)
            });

            const data = await res.json();

            if (data.success) {
                const updatedItem = data.donation || txForm;
                setHistory((prev) =>
                    prev.map((item) => (item._id === txId ? { ...item, ...updatedItem } : item))
                );
                setEditingTxId(null);
            } else {
                alert("Failed to update transaction: " + data.message);
            }
        } catch (error) {
            console.error("Transaction save error:", error);
            alert("Error updating transaction.");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/dashboard/transactions/${recordToDelete.orderId}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (response.ok) {
                setHistory(prevData => prevData.filter(item => item.orderId !== recordToDelete.orderId));
                setRecordToDelete(null);
            } else {
                throw new Error(result.message || 'Failed to delete transaction.');
            }
        } catch (error) {
            console.error('Deletion failed:', error);
            alert(error.message);
            setRecordToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Donor not found.</div>;

    const totalDonation = history.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Delete Confirmation Modal */}
            {recordToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete the transaction? This action cannot be undone.
                        </p>
                        <div className="mt-4 bg-red-50 p-3 rounded-md border border-red-200 space-y-1 text-sm text-gray-700">
                            <p><strong>Order ID:</strong> {recordToDelete.orderId?.substring(0, 12)}</p>
                            <p><strong>Name:</strong> {recordToDelete.name}</p>
                            <p><strong>Phone:</strong> {recordToDelete.phone}</p>
                            <p><strong>Amount:</strong> ₹{Number(recordToDelete.amount || 0).toLocaleString('en-IN')}</p>
                            <p><strong>Seva:</strong> {recordToDelete.seva || 'N/A'}</p>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setRecordToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete Transaction"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Directory
                </Link>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Edit Details
                    </button>
                )}
            </div>

            {/* Profile Information Card */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{profile.name}</h1>

                {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                                <input type="text" value={profile.phone || ""} disabled className="w-full bg-gray-100 border border-gray-300 p-2 rounded text-gray-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-blue-400 p-2 rounded text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">PAN</label>
                                <input
                                    type="text"
                                    name="pan"
                                    value={editForm.pan}
                                    onChange={handleInputChange}
                                    placeholder="e.g. ABCDE1234F"
                                    className="w-full border border-blue-400 p-2 rounded text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={editForm.dob}
                                    onChange={handleInputChange}
                                    className="w-full border border-blue-400 p-2 rounded text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Editable Address Section */}
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-xs font-semibold text-blue-600 uppercase mb-3">Address Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    name="addressLine1"
                                    placeholder="Address Line 1"
                                    value={editForm.addressLine1}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    name="addressLine2"
                                    placeholder="Address Line 2"
                                    value={editForm.addressLine2}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500"
                                />
                                {/* City Dropdown */}
                                <select
                                    name="city"
                                    value={editForm.city}
                                    onChange={handleInputChange}
                                    disabled={cityOptions.length === 0}
                                    className="border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">
                                        {cityOptions.length === 0 ? "Enter PIN Code First" : "Select City / Area"}
                                    </option>
                                    {cityOptions.map((cityName) => (
                                        <option key={cityName} value={cityName}>
                                            {cityName}
                                        </option>
                                    ))}
                                </select>

                                {/* District Dropdown */}
                                <select
                                    name="district"
                                    value={editForm.district}
                                    onChange={handleInputChange}
                                    disabled={!editForm.state}
                                    className="border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">Select District</option>
                                    {districtsList.map((dist) => (
                                        <option key={dist} value={dist}>
                                            {dist}
                                        </option>
                                    ))}
                                </select>
                                
                                {/* State Dropdown */}
                                <select
                                    name="state"
                                    value={editForm.state}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">Select State</option>
                                    {statesList.map((stateName) => (
                                        <option key={stateName} value={stateName}>
                                            {stateName}
                                        </option>
                                    ))}
                                </select>

                                

                                <input
                                    type="text"
                                    name="pinCode"
                                    placeholder="PIN Code"
                                    value={editForm.pinCode}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    populateEditForm(profile);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* READ-ONLY VIEW MODE */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                            <p className="text-gray-900 font-medium">{profile.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                            <p className="text-gray-900 font-medium">{profile.email || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">PAN</p>
                            <p className="text-gray-900 font-mono">{profile.pan || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                            <p className="text-gray-900">
                                {[
                                    profile.address?.addressLine1,
                                    profile.address?.addressLine2,
                                    profile.address?.city,
                                    profile.address?.district,
                                    profile.address?.state
                                ].filter(Boolean).join(", ")}
                                {profile.address?.pinCode ? ` (${profile.address.pinCode})` : ""}
                            </p>
                        </div>
                        <div className="col-span-full flex justify-between items-end pt-2 border-t border-gray-100">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">DOB</p>
                                <p className="text-gray-900 font-medium">
                                    {profile.dob ? formatDateForInput(profile.dob) : "N/A"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Total Donation</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{totalDonation.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Donation History Table */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Donation History</h2>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">Date</th>
                            <th className="p-4 font-semibold text-gray-700">Name</th>
                            <th className="p-4 font-semibold text-gray-700">Order ID</th>
                            <th className="p-4 font-semibold text-gray-700">Seva Name</th>
                            <th className="p-4 font-semibold text-gray-700">Amount</th>
                            <th className="p-4 font-semibold text-gray-700">Source</th>
                            <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((record) => {
                            const isEditingRow = editingTxId === record._id;

                            return (
                                <tr key={record._id} className="hover:bg-gray-50 border-b border-gray-100">
                                    {isEditingRow ? (
                                        <>
                                            <td className="p-2">
                                                <input
                                                    type="date"
                                                    value={txForm.donationDate}
                                                    onChange={(e) => setTxForm({ ...txForm, donationDate: e.target.value })}
                                                    className="border border-blue-400 p-1.5 rounded text-xs text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={txForm.name}
                                                    onChange={(e) => setTxForm({ ...txForm, name: e.target.value })}
                                                    className="border border-blue-400 p-1.5 rounded text-xs text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={txForm.orderId}
                                                    onChange={(e) => setTxForm({ ...txForm, orderId: e.target.value })}
                                                    className="border border-blue-400 p-1.5 rounded text-xs font-mono text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={txForm.seva}
                                                    onChange={(e) => setTxForm({ ...txForm, seva: e.target.value })}
                                                    className="border border-blue-400 p-1.5 rounded text-xs text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 w-full bg-white"
                                                >
                                                    <option value="">Select Seva</option>
                                                    <option value="Easy">Easy</option>
                                                    <option value="AnnaDaan">AnnaDaan</option>
                                                    <option value="Go Seva">Go Seva</option>
                                                    <option value="Janmashtami">Janmashtami</option>
                                                    <option value="Rath Yatra">Rath Yatra</option>
                                                    <option value="Ekadasi">Ekadasi</option>
                                                    <option value="Tula Daan">Tula Daan</option>
                                                    <option value="Nithya Seva">Nithya Seva</option>
                                                    <option value="General Donation">General Donation</option>
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={txForm.amount}
                                                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                                                    className="border border-blue-400 p-1.5 rounded text-xs text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 w-24"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={txForm.source}
                                                    onChange={(e) => setTxForm({ ...txForm, source: e.target.value })}
                                                    className="border border-blue-400 p-1.5 rounded text-xs text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 w-full bg-white"
                                                >
                                                    <option value="">Select Source</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="Website">Website</option>
                                                    <option value="UPI">UPI</option>
                                                </select>
                                            </td>
                                            <td className="p-2 text-right space-x-2">
                                                <button
                                                    onClick={() => handleSaveTx(record._id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-2.5 py-1 rounded transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditingTx}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium px-2.5 py-1 rounded transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 text-gray-600">{new Date(record.donationDate).toLocaleDateString()}</td>
                                            <td className="p-4 text-gray-700 text-xs">{record.name}</td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{record.orderId}</td>
                                            <td className="p-4 text-gray-900 font-medium">{record.seva || "-"}</td>
                                            <td className="p-4 font-semibold text-emerald-600">₹{Number(record.amount || 0).toLocaleString('en-IN')}</td>
                                            <td className="p-4 text-gray-600">{record.source || "-"}</td>
                                            <td className="p-4 text-right space-x-3">
                                                <button
                                                    onClick={() => startEditingTx(record)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setRecordToDelete(record)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}