"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // Extracts the dynamic [phone] from the URL

export default function DonorProfile() {
    const params = useParams();
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch(`/api/dashboard/donors/${params.phone}`);
            const result = await res.json();
            
            if (result.success) {
                setProfile(result.personalInfo);
                setHistory(result.donations);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [params.phone]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Donor not found.</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Directory
                </Link>
            </div>

            {/* Profile Information Card */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{profile.name}</h1>
                
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
                        <p className="text-gray-900">{profile.address.addressLine1}, {profile.address.addressLine2}, {profile.address.city}, {profile.address.district}, {profile.address.state} ({profile.address.pinCode})</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">DOB</p>
                        <p className="text-gray-900">{profile.dob}</p>
                    </div>
                </div>
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
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((record) => (
                            <tr key={record._id} className="hover:bg-gray-50 border-b border-gray-100">
                                <td className="p-4 text-gray-600">{new Date(record.donationDate).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-500 font-mono text-xs">{record.name}</td>
                                <td className="p-4 text-gray-500 font-mono text-xs">{record.orderId}</td>
                                <td className="p-4 text-gray-900 font-medium">{record.seva || "-"}</td>
                                <td className="p-4 font-semibold text-emerald-600">₹{record.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}