"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function DonorsDirectoryView() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch data whenever the searchTerm changes
    useEffect(() => {
        const fetchDonors = async () => {
            setLoading(true);
            const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
            const res = await fetch(`/api/dashboard/donors${query}`);
            const result = await res.json();
            
            if (result.success) {
                setDonors(result.data);
            }
            setLoading(false);
        };

        // Debounce: Wait 300ms after the user stops typing before fetching
        const timeoutId = setTimeout(() => fetchDonors(), 300);
        return () => clearTimeout(timeoutId);
        
    }, [searchTerm]);

    // --- TOP DONORS STATE ---
    const [topDonors, setTopDonors] = useState([]);
    const currentYear = new Date().getFullYear();

    // Fetch the top donors on component mount
    useEffect(() => {
        const fetchTopDonors = async () => {
            try {
                const response = await fetch(`/api/dashboard/top_donors`);
                const result = await response.json();
                if (result.success) {
                    setTopDonors(result.topDonors);
                }
            } catch (error) {
                console.error("Failed to load top donors", error);
            }
        };

        fetchTopDonors();
    }, [currentYear]);

    // Add this function inside your component, before the return statement
    const downloadCSV = () => {
        // Different headers tailored for the Donor CRM
        const headers = ["Name", "Phone", "PAN", "Address", "Total Donations"];
        const rows = donors.map(donor => 
            `"${donor.name}","${donor.phone}","${donor.pan || "N/A"}","${donor.address.addressLine1 + ", " + donor.address.addressLine2 + ", " + donor.address.city + ", " + donor.address.district + ", " + donor.address.state + " (" + donor.address.pinCode + ")"}","${donor.donationCount}"`
        );
        const csvContent = [headers.join(","), ...rows].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "donor_directory_export.csv"; // Specific file name
        link.click();
    };

    // Simple local filter for the main search bar
    // const filteredDonors = donors.filter(donor => 
    //     donor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     donor.phone?.includes(searchQuery)
    // );

    // KPI 1: Total Donors (Reflects filtered view)
    const totalDonors = donors.length;

    return (
        <div>
            {/* --- KPI CARDS (Place this right below your Top Control Bar) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                
                {/* KPI 1: Total Donors */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Directory</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {totalDonors.toLocaleString('en-IN')} <span className="text-sm font-medium text-gray-500">donors</span>
                    </p>
                </div>

                {/* KPI 2: Top 3 Frequent Donors (Fetched from DB API) */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm lg:col-span-3">
                    <div className="flex justify-between items-end mb-3">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Most Frequent Supporters ({currentYear})
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topDonors && topDonors.length > 0 ? (
                            topDonors.map((donor, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                        #{index + 1}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            <Link href={`/dashboard/donors/${donor._id}`} className="block text-blue-600 hover:text-blue-800 hover:underline">
                                            {donor.name || donor._id} {/* Fallback to phone number if name is blank */}
                                            </Link>
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            <span className="font-semibold text-gray-700">{donor.donationCount}</span> donations
                                            <span className="mx-1">•</span> 
                                            <span className="text-emerald-600 font-medium">₹{donor.totalAmount?.toLocaleString('en-IN') || 0}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-2 text-sm text-gray-400 italic flex items-center">
                                No successful donations recorded yet for this year.
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
            {/* Download Button + Search Bar Layout */}
            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-end mb-6">
                
                {/* Search Bar */}
                <div className="w-full md:w-1/3 mt-4 md:mt-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Search Directory</label>
                    <input 
                        type="text" 
                        placeholder="Search by name or phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 p-2 rounded w-full bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                </div>

                {/* Download Button */}
                <button 
                    onClick={downloadCSV}
                    className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded shadow-sm hover:bg-blue-700 transition-colors"
                >
                    Download Directory CSV
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    
                    {/* The sticky top-0 and z-10 classes lock this to the top! */}
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">Name</th>
                            <th className="p-4 font-semibold text-gray-700">Phone (Key)</th>
                            <th className="p-4 font-semibold text-gray-700">PAN</th>
                            <th className="p-4 font-semibold text-gray-700">Address</th>
                            <th className="p-4 font-semibold text-gray-700 text-center">Total Donations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading directory...</td></tr>
                        ) : donors.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No donors match your search.</td></tr>
                        ) : donors.map((donor) => (
                            <tr key={donor._id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
                                <td className="p-4 font-medium text-blue-600">
                                    {/* Link to the dynamic profile page we created earlier */}
                                    <Link href={`/dashboard/donors/${donor.phone}`} className="block text-blue-600 hover:text-blue-800 hover:underline">
                                        {donor.name}
                                    </Link>
                                </td>
                                <td className="p-4 text-gray-600">{donor.phone}</td>
                                <td className="p-4 text-gray-600 font-mono">{donor.pan || "N/A"}</td>
                                <td className="p-4 text-gray-500 truncate max-w-xs">{donor.address.city}</td>
                                <td className="p-4 text-gray-600 font-semibold text-center">{donor.donationCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}