"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DonorsDirectory() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonors = async () => {
            const res = await fetch('/api/dashboard/donors');
            const result = await res.json();
            if (result.success) setDonors(result.data);
            setLoading(false);
        };
        fetchDonors();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Donor Directory</h1>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Transactions
                </Link>
            </div>

            <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">Name</th>
                            <th className="p-4 font-semibold text-gray-700">Phone (Key)</th>
                            <th className="p-4 font-semibold text-gray-700">PAN</th>
                            <th className="p-4 font-semibold text-gray-700">Address</th>
                            <th className="p-4 font-semibold text-gray-700">Total Donations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading directory...</td></tr>
                        ) : donors.map((donor) => (
                            <tr key={donor._id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
                                {/* Wrap the first cell in a link so the row is clickable */}
                                <td className="p-4 font-medium text-blue-600">
                                    <Link href={`/dashboard/donors/${donor.phone}`} className="block text-blue-600 hover:text-blue-800 hover:underline">
                                        {donor.name}
                                    </Link>
                                </td>
                                <td className="p-4 text-gray-600">{donor.phone}</td>
                                <td className="p-4 text-gray-600 font-mono">{donor.pan || "N/A"}</td>
                                <td className="p-4 text-gray-500 truncate max-w-xs">{donor.address.city}</td>
                                <td className="p-4 text-gray-600 font-semibold">{donor.donationCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}