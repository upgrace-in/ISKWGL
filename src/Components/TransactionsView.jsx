"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend , BarChart, Bar
} from 'recharts';
import Link from "next/link";

export default function TransactionsView({ session }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(null); // For the 3-dot menu
    const [recordToDelete, setRecordToDelete] = useState(null); // For delete confirmation modal
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletionSuccess, setDeletionSuccess] = useState(false);

    const menuRef = useRef(null);

    
    const isAdmin = session?.user?.role === 'admin';

    // Helper function to format dates as YYYY-MM-DD for the input fields
    const getFormattedDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Calculate the first and last day of the current ongoing month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Pro-Tip: Using day '0' of the NEXT month automatically gives you the last day of the CURRENT month!
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); 

    // State to hold all active filters
    const [filters, setFilters] = useState({ 
        search: "", 
        name: "", 
        sevaName: "", 
        messageSent: "",
        source: "",
        startDate: getFormattedDate(firstDay), 
        endDate: getFormattedDate(today)    
    });

    // Add this right below your filters state
    const [chartTimeframe, setChartTimeframe] = useState("daily");

    // Fetch data whenever ANY filter changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Clean out empty filters so we don't send messy URLs
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== "")
            );
            
            const query = new URLSearchParams(activeFilters).toString();
            const res = await fetch(`/api/dashboard?${query}`);
            const result = await res.json();
            
            if (result.success) {
                setData(result.data);
            }
            setLoading(false);
        };
        
        // Debounce to prevent fetching on every single keystroke
        const timeoutId = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timeoutId);
        
    }, [filters]);

    // Effect to close the 3-dot menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the menu container and not on a menu button
            if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('button[data-menu-button]')) {
                setIsMenuOpen(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Add this function inside your component, before the return statement
    const downloadCSV = () => {
        const headers = ["Order ID", "Name", "Phone", "Amount", "Seva Name", "Source", "Status", "Message Sent", "Date"];
        const rows = data.map(row => 
            `"${row.orderId}","${row.name}","${row.phone}","${row.amount}","${row.seva || ""}","${row.source || 'N/A'}","${row.status}","${row.messageSent ? 'Yes' : 'No'}","${new Date(row.donationDate).toLocaleDateString()}"`
        );
        const csvContent = [headers.join(","), ...rows].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "transactions_export.csv"; // Specific file name
        link.click();
    };

    const handleSendMessage = async (orderId) => {
        try {
            // Replace with your actual backend endpoint when ready
            const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/processSuccess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Sending the order_id in the body exactly as requested
                body: JSON.stringify({ orderId: orderId, formentry: true }), 
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Message triggered successfully for Order:", orderId);
                // You can replace this alert with a nicer toast notification later
                alert("Message sent successfully!"); 
            } else {
                console.error("API Error:", result);
                alert("Failed to send message.");
            }
        } catch (error) {
            console.error("Network or server error:", error);
            alert("An error occurred while trying to send the message.");
        }
    };

    const handleOpenDeleteModal = (record) => {
        setRecordToDelete(record);
        setIsMenuOpen(null); // Close the menu
    };

    const handleCloseDeleteModal = () => {
        setRecordToDelete(null);
        setDeletionSuccess(false); // Reset success state on close
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
                setData(prevData => prevData.filter(item => item.orderId !== recordToDelete.orderId));
                setDeletionSuccess(true);
            } else {
                throw new Error(result.message || 'Failed to delete transaction.');
            }
        } catch (error) {
            console.error('Deletion failed:', error);
            alert(error.message);
            handleCloseDeleteModal(); // Close modal on error
        } finally {
            setIsDeleting(false);
        }
    };
    // --- INDEPENDENT CHART TOGGLE STATES ---
    const [hiddenLineSevas, setHiddenLineSevas] = useState([]);
    const [hiddenPieSevas, setHiddenPieSevas] = useState([]);

    // Handler for the Comparative Line Chart
    const handleLineLegendClick = (e) => {
        const clickedSeva = e.dataKey; 
        if (hiddenLineSevas.includes(clickedSeva)) {
            setHiddenLineSevas(hiddenLineSevas.filter(name => name !== clickedSeva));
        } else {
            setHiddenLineSevas([...hiddenLineSevas, clickedSeva]);
        }
    };

    // Handler for the Seva Distribution Pie Chart
    const handlePieLegendClick = (e) => {
        const clickedSeva = e.value; 
        if (hiddenPieSevas.includes(clickedSeva)) {
            setHiddenPieSevas(hiddenPieSevas.filter(name => name !== clickedSeva));
        } else {
            setHiddenPieSevas([...hiddenPieSevas, clickedSeva]);
        }
    };

    // --- KPI CALCULATIONS ---
    const kpis = useMemo(() => {
        
        // 1. Total Collected
        const totalCollected = data.reduce((sum, record) => sum + Number(record.amount), 0);

        // 2. Top Seva Type
        const sevaStats = {};
        data.forEach(record => {
            const seva = record.seva || "Unknown";
            if (!sevaStats[seva]) sevaStats[seva] = { total: 0, count: 0 };
            sevaStats[seva].total += Number(record.amount);
            sevaStats[seva].count += 1;
        });
        
        let topSeva = { name: "N/A", total: 0, count: 0 };
        for (const [name, stats] of Object.entries(sevaStats)) {
            if (stats.total > topSeva.total) {
                topSeva = { name, total: stats.total, count: stats.count };
            }
        }

        // 3. Top Donation Range Bucket
        const buckets = {
            "₹0 - ₹500": 0,
            "₹501 - ₹1,000": 0,
            "₹1,001 - ₹2,000": 0,
            "₹2,001 - ₹5,000": 0,
            "Above ₹5,000": 0
        };
        
        data.forEach(record => {
            const amt = Number(record.amount);
            if (amt <= 500) buckets["₹0 - ₹500"] += amt;
            else if (amt <= 1000) buckets["₹501 - ₹1,000"] += amt;
            else if (amt <= 2000) buckets["₹1,001 - ₹2,000"] += amt;
            else if (amt <= 5000) buckets["₹2,001 - ₹5,000"] += amt;
            else buckets["Above ₹5,000"] += amt;
        });

        let topBucket = { name: "N/A", total: 0 };
        for (const [name, total] of Object.entries(buckets)) {
            if (total > topBucket.total) {
                topBucket = { name, total };
            }
        }

        return { totalCollected, topSeva, topBucket };
    }, [data]);

    // --- CHART DATA PROCESSING ---
    const chartData = useMemo(() => {
        
        // If there's no data, return an empty array
        if (data.length === 0) return [];

        const groupedData = {};

        data.forEach(record => {
            const d = new Date(record.donationDate);
            let key = "";

            // Determine the bucket label based on the selected timeframe
            if (chartTimeframe === 'daily') {
                key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } 
            else if (chartTimeframe === 'monthly') {
                key = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            } 
            else if (chartTimeframe === 'yearly') {
                key = d.getFullYear().toString();
            } 
            else if (chartTimeframe === 'weekly') {
                // Find the Monday of that week
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(new Date(d).setDate(diff));
                key = `Week of ${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            }

            // Add the amount to the correct bucket
            if (!groupedData[key]) {
                groupedData[key] = { date: key, amount: 0, timestamp: d.getTime() };
            }
            groupedData[key].amount += Number(record.amount);
        });

        // Convert the grouped object into an array and sort it chronologically
        return Object.values(groupedData).sort((a, b) => a.timestamp - b.timestamp);
    }, [data, chartTimeframe]);

    // A clean, vibrant color palette for your different Seva campaigns
    const COLORS = ['#059669', '#3B82F6', '#D97706', '#7C3AED', '#EC4899', '#6B7280'];

    // --- DYNAMIC COLOR GENERATOR ---
    // Converts any string into a unique, visually pleasing HSL color
    const generateColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Calculate a Hue from 0 to 360
        const hue = Math.abs(hash % 360);
        
        // Return an HSL string. 
        // 70% Saturation keeps it vibrant. 
        // 45% Lightness keeps it dark enough to read white text over it.
        return `hsl(${hue}, 70%, 45%)`;
    };

    // --- PIE CHART DATA PROCESSING ---
    const pieData = useMemo(() => {
        const sevaStats = {};

        data.forEach(record => {
            const seva = record.seva || "Unknown Seva";
            if (!sevaStats[seva]) {
                sevaStats[seva] = { name: seva, value: 0, count: 0 };
            }
            sevaStats[seva].value += Number(record.amount);
            sevaStats[seva].count += 1;
        });

        return Object.values(sevaStats);
    }, [data]);

    // --- CUSTOM PIE HOVER TOOLTIP ---
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const itemData = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
                    <p className="font-bold text-gray-900 mb-1.5 border-b pb-1">
                        {itemData.name}
                    </p>
                    <p className="text-gray-600 flex justify-between gap-4">
                        <span>Amount:</span> 
                        <span className="font-semibold text-emerald-600">
                            ₹{itemData.value.toLocaleString('en-IN')}
                        </span>
                    </p>
                    <p className="text-gray-600 flex justify-between gap-4">
                        <span>Donors:</span> 
                        <span className="font-semibold text-gray-900">
                            {itemData.count}
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // --- MULTI-LINE COMPARATIVE CHART DATA ---
    const [multiTimeframe, setMultiTimeframe] = useState("daily");

    const comparativeData = useMemo(() => {
        if (data.length === 0) return { formattedData: [], uniqueSevas: [] };

        // 1. Find all unique campaigns so we know how many lines to draw
        const uniqueSevas = Array.from(new Set(data.map(r => r.seva || "Unknown Seva")));
        const groupedData = {};

        // 2. Group the data by time bucket AND Seva
        data.forEach(record => {
            const d = new Date(record.donationDate);
            const seva = record.seva || "Unknown Seva";
            let key = "";

            if (multiTimeframe === 'daily') {
                key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } else if (multiTimeframe === 'weekly') {
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(new Date(d).setDate(diff));
                key = `Week of ${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            } else if (multiTimeframe === 'monthly') {
                key = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            } else if (multiTimeframe === 'yearly') {
                key = d.getFullYear().toString();
            }

            // If this date bucket doesn't exist yet, create it and set all Sevas to 0
            if (!groupedData[key]) {
                groupedData[key] = { date: key, timestamp: d.getTime() };
                uniqueSevas.forEach(s => groupedData[key][s] = 0);
            }

            // Add the amount to the specific Seva in this specific time bucket
            groupedData[key][seva] += Number(record.amount);
        });

        // Sort chronologically
        const formattedData = Object.values(groupedData).sort((a, b) => a.timestamp - b.timestamp);
        
        return { formattedData, uniqueSevas };
    }, [data, multiTimeframe]);

    // --- BAR CHART DATA PROCESSING (DONATION BUCKETS) ---
    const bucketData = useMemo(() => {
        
        // Initialize the five target range buckets
        const buckets = [
            { name: "₹0 - ₹500", amount: 0, count: 0 },
            { name: "₹501 - ₹1,000", amount: 0, count: 0 },
            { name: "₹1,001 - ₹2,000", amount: 0, count: 0 },
            { name: "₹2,001 - ₹5,000", amount: 0, count: 0 },
            { name: "Above ₹5,000", amount: 0, count: 0 }
        ];

        data.forEach(record => {
            const amt = Number(record.amount);
            if (amt <= 500) {
                buckets[0].amount += amt;
                buckets[0].count += 1;
            } else if (amt <= 1000) {
                buckets[1].amount += amt;
                buckets[1].count += 1;
            } else if (amt <= 2000) {
                buckets[2].amount += amt;
                buckets[2].count += 1;
            } else if (amt <= 5000) {
                buckets[3].amount += amt;
                buckets[3].count += 1;
            } else {
                buckets[4].amount += amt;
                buckets[4].count += 1;
            }
        });

        return buckets;
    }, [data]);

    // --- CUSTOM BAR HOVER TOOLTIP ---
    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const itemData = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
                    <p className="font-bold text-gray-900 mb-1.5 border-b pb-1 text-xs uppercase tracking-wider text-gray-500">
                        Range: {itemData.name}
                    </p>
                    <p className="text-gray-600 flex justify-between gap-6 mb-1">
                        <span>Total Collected:</span> 
                        <span className="font-semibold text-blue-600">
                            ₹{itemData.amount.toLocaleString('en-IN')}
                        </span>
                    </p>
                    <p className="text-gray-600 flex justify-between gap-6">
                        <span>No. of Donors:</span> 
                        <span className="font-semibold text-gray-900">
                            {itemData.count} donors
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            {/* --- DELETE CONFIRMATION MODAL --- */}
            {recordToDelete && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 transform transition-all">
                        {deletionSuccess ? (
                            // --- SUCCESS VIEW ---
                            <div>
                                <div className="flex items-center justify-center mx-auto bg-green-100 rounded-full h-12 w-12">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 text-center mt-4">Deletion Successful</h3>
                                <p className="text-sm text-gray-600 mt-2 text-center">
                                    The transaction has been permanently deleted.
                                </p>
                                <div className="mt-6 flex justify-center">
                                    <button onClick={handleCloseDeleteModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // --- CONFIRMATION VIEW ---
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Are you sure you want to permanently delete this transaction? This action cannot be undone.
                                </p>
                                <div className="mt-4 bg-red-50 p-3 rounded-md border border-red-200 space-y-1 text-sm text-gray-700">
                                    <p><strong>Order ID:</strong> {recordToDelete.orderId?.substring(0, 12)}...</p>
                                    <p><strong>Name:</strong> {recordToDelete.name}</p>
                                    <p><strong>Phone:</strong> {recordToDelete.phone}</p>
                                    <p><strong>Amount:</strong> ₹{recordToDelete.amount.toLocaleString('en-IN')}</p>
                                    <p><strong>Seva:</strong> {recordToDelete.seva || 'N/A'}</p>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button onClick={handleCloseDeleteModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed font-medium">
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* --- PARALLEL TOP CONTROL BAR --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                
                {/* Title */}
                {/* <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1> */}
                
                {/* Global Controls (Dates & Export) */}
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Date Range "Pill" */}
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">From</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            value={filters.startDate} 
                            onChange={handleFilterChange} 
                            className="bg-transparent text-sm font-medium text-gray-800 outline-none cursor-pointer"
                        />
                        
                        {/* Vertical Divider */}
                        <div className="w-px h-5 bg-gray-300 mx-3"></div>
                        
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">To</label>
                        <input 
                            type="date" 
                            name="endDate" 
                            value={filters.endDate} 
                            onChange={handleFilterChange} 
                            className="bg-transparent text-sm font-medium text-gray-800 outline-none cursor-pointer"
                        />
                    </div>

                </div>
                    
                    {/* Download Button */}
                    <button 
                        onClick={downloadCSV}
                        className="bg-blue-600 text-white px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        {/* Optional SVG Icon for extra polish */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Export CSV
                    </button>
            </div>
            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* KPI 1: Total Collected */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Collected</p>
                    <p className="text-3xl font-bold text-emerald-600">
                        ₹{kpis.totalCollected.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* KPI 2: Top Seva */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Top Performing Seva</p>
                    <p className="text-xl font-bold text-gray-900 truncate">{kpis.topSeva.name}</p>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                        <span><span className="font-semibold text-gray-900">₹{kpis.topSeva.total.toLocaleString('en-IN')}</span> raised</span>
                        <span><span className="font-semibold text-gray-900">{kpis.topSeva.count}</span> donors</span>
                    </div>
                </div>

                {/* KPI 3: Top Range Bucket */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Highest Donation Bucket</p>
                    <p className="text-xl font-bold text-gray-900">{kpis.topBucket.name}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        Total generated: <span className="font-semibold text-emerald-600">₹{kpis.topBucket.total.toLocaleString('en-IN')}</span>
                    </div>
                </div>

            </div>
            {/* --- CHARTS GRID SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* CHART A: Donation TRENDS (Your existing line chart inside a modified wrapper) */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Donation Trends</h2>
                            {/* <p className="text-sm text-gray-500">Successful donations over time</p> */}
                        </div>
                        <select 
                            value={chartTimeframe} 
                            onChange={(e) => setChartTimeframe(e.target.value)}
                            className="border border-gray-300 p-2 rounded-md bg-gray-50 text-sm font-medium shadow-sm outline-none"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Donation']} />
                                    <Line type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No record data found.</div>
                        )}
                    </div>
                </div>

                {/* CHART B: SEVA DISTRIBUTION PIE CHART */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-[450px]">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Seva Distribution</h2>
                    {/* <p className="text-sm text-gray-500">Share of revenue by campaign initiative</p> */}
                </div>

                <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip content={<CustomPieTooltip />} />
                                
                                <Pie
                                    data={pieData.map(entry => ({
                                        ...entry,
                                        // Use hiddenPieSevas here
                                        value: hiddenPieSevas.includes(entry.name) ? 0 : entry.value
                                    }))}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={65} 
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            // Use hiddenPieSevas here
                                            fill={hiddenPieSevas.includes(entry.name) ? '#d1d5db' : generateColor(entry.name)} 
                                        />
                                    ))}
                                </Pie>
                                
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={40}
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '12px', color: '#374151', paddingTop: '10px', cursor: 'pointer' }}
                                    // Use the new Pie click handler
                                    onClick={handlePieLegendClick}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-sm">No successful transactions recorded.</div>
                    )}
                </div>
            </div>

            </div>

            {/* --- SECOND CHARTS GRID SECTION (Comparative & Distribution) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* CHART C: COMPARATIVE SEVA PERFORMANCE CHART */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Seva Comparison</h2>
                            {/* <p className="text-sm text-gray-500">Donation overlapping by specific Seva</p> */}
                        </div>
                        
                        <select 
                            value={multiTimeframe} 
                            onChange={(e) => setMultiTimeframe(e.target.value)}
                            className="border border-gray-300 p-2 rounded-md bg-gray-50 text-sm font-medium shadow-sm outline-none"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        {comparativeData.formattedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={comparativeData.formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                                    <Tooltip 
                                        cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name]}
                                    />
                                    {/* 1. Add onClick and a pointer cursor to the Legend */}
                                    <Legend 
                                        verticalAlign="top" 
                                        height={36} 
                                        wrapperStyle={{ paddingBottom: '10px', cursor: 'pointer' }} 
                                        // Use the new Line click handler
                                        onClick={handleLineLegendClick}
                                    />
                                    
                                    {comparativeData.uniqueSevas.map((sevaName) => (
                                        <Line 
                                            key={sevaName}
                                            type="monotone" 
                                            dataKey={sevaName} 
                                            name={sevaName}
                                            // Use hiddenLineSevas here
                                            hide={hiddenLineSevas.includes(sevaName)} 
                                            stroke={hiddenLineSevas.includes(sevaName) ? '#d1d5db' : generateColor(sevaName)} 
                                            strokeWidth={2.5} 
                                            dot={{ strokeWidth: 2, r: 3 }} 
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No comparative data found.</div>
                        )}
                    </div>
                </div>

                {/* CHART D: DONATION AMOUNT RANGES BAR CHART */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-[450px]">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Donation Value Distribution</h2>
                        {/* <p className="text-sm text-gray-500">Total Donation generated by contribution size</p> */}
                    </div>

                    <div className="flex-1 w-full min-h-0 mt-4">
                        {bucketData.some(b => b.count > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bucketData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                                    <Tooltip 
                                        content={<CustomBarTooltip />}
                                        cursor={{ fill: '#F3F4F6', opacity: 0.6 }}
                                    />
                                    <Bar 
                                        dataKey="amount" 
                                        fill="#3B82F6" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                No financial records match the active filters.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* <div className="flex justify-end mb-4">
                <button 
                    onClick={downloadCSV}
                    className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded shadow-sm hover:bg-blue-700 transition-colors"
                >
                    Download Transactions CSV
                </button>
            </div> */}

            {/* --- FILTER CONTROL PANEL --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
                
                {/* Search Bar (Spans 2 columns if you want, or just 1. Let's make it span 1 for perfect balance) */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
                    <input type="text" name="search" placeholder="Order ID or Phone..." onChange={handleFilterChange} className="border border-gray-300 p-2 rounded-md w-full bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                    <input 
                        type="text" name="name" placeholder="Filter by name..." 
                        onChange={handleFilterChange} 
                        className="border p-2 rounded w-full bg-gray-50 focus:bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Seva Name</label>
                    <input 
                        type="text" name="sevaName" placeholder="e.g. Rath Yatra" 
                        onChange={handleFilterChange} 
                        className="border p-2 rounded w-full bg-gray-50 focus:bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Source</label>
                    <select name="source" onChange={handleFilterChange} className="border p-2 rounded w-full bg-gray-50 focus:bg-white">
                        <option value="">Any</option>
                        <option value="Cash">Cash</option>
                        <option value="Website">Website</option>
                        <option value="UPI">UPI</option>
                    </select>
                </div>

                {isAdmin && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Message Sent</label>
                        <select name="messageSent" onChange={handleFilterChange} className="border p-2 rounded w-full bg-gray-50 focus:bg-white">
                            <option value="">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                )}
                
            </div>

            {/* --- DATA TABLE --- */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    
                    {/* The sticky top-0 and z-10 classes lock this to the top! */}
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">Order ID</th>
                            <th className="p-4 font-semibold text-gray-700">Name</th>
                            <th className="p-4 font-semibold text-gray-700">Phone</th>
                            <th className="p-4 font-semibold text-gray-700">Amount</th>
                            <th className="p-4 font-semibold text-gray-700">Seva Name</th>
                            <th className="p-4 font-semibold text-gray-700">Source</th>
                            {isAdmin && <th className="p-4 font-semibold text-gray-700">Msg Sent</th>}
                            <th className="p-4 font-semibold text-gray-700">Date</th>
                            {isAdmin && <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 9 : 7} className="p-8 text-center text-gray-500">Loading data...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={isAdmin ? 9 : 7} className="p-8 text-center text-gray-500">No records match your filters.</td></tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record._id} className="hover:bg-gray-50 border-b border-gray-100">
                                    <td className="p-4 text-gray-500 font-mono text-xs">{record.orderId?.substring(0, 8)}...</td>
                                    <td className="p-4 font-medium text-gray-900">
                                        <Link href={`/dashboard/donors/${record.phone}`} className="block text-blue-600 hover:text-blue-800 hover:underline">
                                            {record.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-gray-600">{record.phone}</td>
                                    <td className="p-4 font-semibold text-emerald-600">₹{record.amount}</td>
                                    <td className="p-4 text-gray-600">{record.seva || "-"}</td>
                                    <td className="p-4 text-gray-600">{record.source || "N/A"}</td>
                                    {isAdmin && (
                                        <td className="p-4">
                                            {record.messageSent ? (
                                                <span className="text-green-600 font-bold">✓</span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleSendMessage(record.orderId)}
                                                    className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm"
                                                >
                                                    Send Message
                                                </button>
                                            )}
                                        </td>
                                    )}
                                    <td className="p-4 text-gray-500">{new Date(record.donationDate).toLocaleDateString()}</td>
                                    {isAdmin && (
                                        <td className="p-4 text-center">
                                            <div className="relative inline-block">
                                                <button 
                                                    data-menu-button 
                                                    onClick={() => setIsMenuOpen(isMenuOpen === record._id ? null : record._id)} 
                                                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                                {isMenuOpen === record._id && (
                                                    <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200 py-1">
                                                        <button onClick={() => handleOpenDeleteModal(record)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}