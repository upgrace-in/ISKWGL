"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DonorsDirectoryView() {
    const { data: session } = useSession();
    const role = session?.user?.role;

    const [activeTab, setActiveTab] = useState("all");

    // --- TAB 1 STATE (All Donors) ---
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // --- TAB 2 STATE (Date Range Filter + Search) ---
    const currentYear = new Date().getFullYear();
    const todayStr = new Date().toISOString().split("T")[0];
    
    const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
    const [endDate, setEndDate] = useState(todayStr);
    const [rangeSearchTerm, setRangeSearchTerm] = useState("");
    const [rangeDonors, setRangeDonors] = useState([]);
    const [rangeLoading, setRangeLoading] = useState(false);

    // --- TOP DONORS STATE ---
    const [topDonors, setTopDonors] = useState([]);

    // --- FRIEND RAISER USERS STATE (For Admin Assignment) ---
    const [friendRaiserUsers, setFriendRaiserUsers] = useState([]);

    // Fetch Friend Raiser Users if Admin
    useEffect(() => {
        if (role === "admin") {
            fetch("/api/admin/users")
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.users) {
                        setFriendRaiserUsers(data.users.filter((u) => u.role === "friend_raiser"));
                    }
                })
                .catch((err) => console.error("Failed to load friend raiser users", err));
        }
    }, [role]);

    // Fetch All Donors (Tab 1)
    useEffect(() => {
        const fetchDonors = async () => {
            setLoading(true);
            try {
                const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
                const res = await fetch(`/api/dashboard/donors${query}`);
                const result = await res.json();
                
                if (result.success) {
                    setDonors(result.data);
                }
            } catch (error) {
                console.error("Failed to load donors", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => fetchDonors(), 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch Date Range Donors (Tab 2) with Debounced Search
    useEffect(() => {
        if (activeTab === "range") {
            const fetchRangeDonors = async () => {
                setRangeLoading(true);
                try {
                    let query = `?startDate=${startDate}&endDate=${endDate}`;
                    if (rangeSearchTerm) {
                        query += `&search=${encodeURIComponent(rangeSearchTerm)}`;
                    }
                    const res = await fetch(`/api/dashboard/donors${query}`);
                    const result = await res.json();
                    
                    if (result.success) {
                        setRangeDonors(result.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch range donors", error);
                } finally {
                    setRangeLoading(false);
                }
            };

            const timeoutId = setTimeout(() => fetchRangeDonors(), 300);
            return () => clearTimeout(timeoutId);
        }
    }, [activeTab, startDate, endDate, rangeSearchTerm]);

    // Handle Admin Donor Assignment Change
    const handleAssignChange = async (phone, assignedToEmail) => {
        const confirmed = confirm(`Are you sure you want to assign this donor to ${assignedToEmail || "Unassigned"}?`);
        if (!confirmed) return;

        try {
            const res = await fetch("/api/dashboard/donors", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, assignedToEmail }),
            });
            const result = await res.json();
            if (result.success) {
                // Refresh data
                setDonors((prev) => prev.map(d => d.phone === phone ? { ...d, assignedTo: assignedToEmail } : d));
                setRangeDonors((prev) => prev.map(d => d.phone === phone ? { ...d, assignedTo: assignedToEmail } : d));
            } else {
                alert("Failed to update assignment");
            }
        } catch (err) {
            console.error("Error updating assignment", err);
        }
    };

    // Memoize sorted lists for performance
    const sortedDonors = useMemo(() => {
        return [...donors].sort((a, b) => b.donationCount - a.donationCount);
    }, [donors]);

    const sortedRangeDonors = useMemo(() => {
        return [...rangeDonors].sort((a, b) => b.donationCount - a.donationCount);
    }, [rangeDonors]);

    // Fetch Top Donors
    const fetchTopDonors = useCallback(async () => {
        try {
            const response = await fetch(`/api/dashboard/top_donors`, { cache: 'no-store' });
            const result = await response.json();
            if (result.success) {
                setTopDonors(result.topDonors);
            }
        } catch (error) {
            console.error("Failed to load top donors", error);
        }
    }, []);

    useEffect(() => {
        fetchTopDonors();
    }, [fetchTopDonors]);

    // Dynamic CSV Export
    const downloadCSV = () => {
        const dataset = activeTab === "all" ? sortedDonors : sortedRangeDonors;
        const filename = activeTab === "all" ? "donor_directory_export.csv" : `donors_${startDate}_to_${endDate}.csv`;

        const headers = ["Name", "Phone", "Latest Donation", "Latest Follow-up", "Address", "Total Donations"];
        const rows = dataset.map(donor => 
            `"${donor.name}","${donor.phone}","${donor.latestDonationDate || "N/A"}","${donor.latestFollowUp?.text?.replace(/"/g, '""') || "N/A"}","${donor.address?.addressLine1 || ""}, ${donor.address?.city || ""}","${donor.donationCount}"`
        );
        const csvContent = [headers.join(","), ...rows].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const totalDonors = activeTab === "all" ? donors.length : rangeDonors.length;
    const colSpanCount = role === "admin" ? 7 : 6;

    return (
        <div className="p-8 max-w-full mx-auto">
            {/* --- TABS NAVIGATION BAR --- */}
            <div className="flex border-b border-gray-200 mb-6 justify-between items-center">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === "all"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {role === "donor_care" ? "My Assigned Donors" : "All-Time Directory"}
                    </button>
                    <button
                        onClick={() => setActiveTab("range")}
                        className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === "range"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Date Range Filter ({currentYear})
                    </button>
                </div>

                {/* --- DOWNLOAD BUTTON (Admin Only) --- */}
                {(role === "admin" || role === "manager") && (
                    <button 
                        onClick={downloadCSV}
                        className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded shadow-sm hover:bg-green-700 transition-colors"
                    >
                        Download {activeTab === "all" ? "Directory" : "Range"} CSV
                    </button>
                )}
            </div>

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {activeTab === "all" ? (role === "donor_care" ? "My Assigned Count" : "Total Directory") : "Filtered Count"}
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                        {totalDonors.toLocaleString('en-IN')} <span className="text-sm font-medium text-gray-500">donors</span>
                    </p>
                </div>

                {/* Top 3 Supporters KPI Card */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm lg:col-span-3">
                    <div className="flex justify-between items-end mb-3">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Most Frequent Supporters ({currentYear})
                        </p>
                        <button 
                            onClick={fetchTopDonors} 
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none">
                            Refresh
                        </button>
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
                                            <Link href={`/dashboard/donors/${donor.phone}`} className="block text-blue-600 hover:text-blue-800 hover:underline">
                                                {donor.name || donor._id}
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

            {/* --- CONTROLS BAR --- */}
            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-end mb-6 gap-4">
                {activeTab === "all" && (
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Search Directory</label>
                        <input 
                            type="text" 
                            placeholder="Search by name or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                )}

                {activeTab === "range" && (
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-4/5 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 p-2 rounded bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 p-2 rounded bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-full md:flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Search Filter</label>
                            <input 
                                type="text"
                                placeholder="Search by name or phone..."
                                value={rangeSearchTerm}
                                onChange={(e) => setRangeSearchTerm(e.target.value)}
                                className="border border-gray-300 p-2 rounded w-full bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* --- DATA TABLE --- */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full table-fixed text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700 w-[150px]">Name</th>
                            <th className="p-4 font-semibold text-gray-700 w-36 text-center">Phone (Key)</th>
                            <th className="p-4 font-semibold text-gray-700 w-30 text-center">Latest Donation</th>
                            <th className="p-4 font-semibold text-gray-700 w-60 text-center">Latest Follow-up</th>
                            <th className="p-4 font-semibold text-gray-700 w-30 text-center">Address</th>
                            {role === "admin" && (
                                <th className="p-4 font-semibold text-gray-700 w-48 text-center">Assigned Caregiver</th>
                            )}
                            <th className="p-4 font-semibold text-gray-700 w-28 text-center">
                                {activeTab === "all" ? "Total Donations" : "Donations in Range"}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === "all" ? (
                            loading ? (
                                <tr><td colSpan={colSpanCount} className="p-8 text-center text-gray-500">Loading directory...</td></tr>
                            ) : sortedDonors.length === 0 ? (
                                <tr><td colSpan={colSpanCount} className="p-8 text-center text-gray-500">No donors match your search.</td></tr>
                            ) : sortedDonors.map((donor) => (
                                <tr key={donor._id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
                                    <td className="p-4 font-medium text-blue-600 truncate">
                                        <Link href={`/dashboard/donors/${donor.phone}`} className="block text-blue-600 hover:text-blue-800 hover:underline truncate w-[150px] min-w-[120px] max-w-[150px]">
                                            {donor.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-gray-600 text-center">{donor.phone}</td>
                                    <td className="p-4 text-gray-600 text-center">{donor.latestDonationDate || "N/A"}</td>
                                    <td className="p-4 text-gray-600 truncate w-[150px] min-w-[120px] max-w-[150px] text-center">{donor.latestFollowUp ? donor.latestFollowUp.followupDate : "N/A"}</td>
                                    <td className="p-4 text-gray-500 truncate w-[150px] min-w-[120px] max-w-[150px] text-center">{donor.address?.city || "N/A"}</td>
                                    
                                    {/* --- ADMIN ASSIGNMENT DROPDOWN --- */}
                                    {role === "admin" && (
                                        <td className="p-4 text-center">
                                            <select
                                                value={donor.assignedTo || ""}
                                                onChange={(e) => handleAssignChange(donor.phone, e.target.value)}
                                                className="p-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full"
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {friendRaiserUsers.map((user) => (
                                                    <option key={user.email} value={user.email}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    )}

                                    <td className="p-4 text-gray-600 font-semibold text-center">{donor.donationCount}</td>
                                </tr>
                            ))
                        ) : (
                            rangeLoading ? (
                                <tr><td colSpan={colSpanCount} className="p-8 text-center text-gray-500">Loading filtered donors...</td></tr>
                            ) : sortedRangeDonors.length === 0 ? (
                                <tr><td colSpan={colSpanCount} className="p-8 text-center text-gray-500">No donors found matching your criteria.</td></tr>
                            ) : sortedRangeDonors.map((donor) => (
                                <tr key={donor._id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
                                    <td className="p-4 font-medium text-blue-600 truncate">
                                        <Link href={`/dashboard/donors/${donor.phone}`} className="block text-blue-600 hover:text-blue-800 hover:underline truncate w-[150px] min-w-[120px] max-w-[150px]">
                                            {donor.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-gray-600 text-center">{donor.phone}</td>
                                    <td className="p-4 text-gray-600 text-center">{donor.latestDonationDate || "N/A"}</td>
                                    <td className="p-4 text-gray-600 truncate w-[150px] min-w-[120px] max-w-[150px] text-center">{donor.latestFollowUp ? donor.latestFollowUp.followupDate : "N/A"}</td>
                                    <td className="p-4 text-gray-500 truncate w-[150px] min-w-[120px] max-w-[150px] text-center">{donor.address?.city || "N/A"}</td>
                                    
                                    {/* --- ADMIN ASSIGNMENT DROPDOWN --- */}
                                    {role === "admin" && (
                                        <td className="p-4 text-center">
                                            <select
                                                value={donor.assignedTo || ""}
                                                onChange={(e) => handleAssignChange(donor.phone, e.target.value)}
                                                className="p-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full"
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {friendRaiserUsers.map((user) => (
                                                    <option key={user.email} value={user.email}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    )}

                                    <td className="p-4 text-gray-600 font-semibold text-center">{donor.donationCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}