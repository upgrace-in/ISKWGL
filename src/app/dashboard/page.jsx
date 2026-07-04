"use client";
import { useState } from "react";
import TransactionsView from "@/Components/TransactionsView";
import DonorsDirectoryView from "@/Components/DonorsDirectoryView";
import DonationEntryForm from "@/Components/DonationEntryForm";

export default function UnifiedDashboard() {
    // State to track which view is currently selected
    const [activeTab, setActiveTab] = useState("transactions");

    return (
        <div className="p-8 max-w-7xl mx-auto">
            
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* --- TAB NAVIGATION UI --- */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab("transactions")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === "transactions" 
                                ? "border-blue-600 text-blue-600" 
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        All Transactions
                    </button>

                    <button
                        onClick={() => setActiveTab("donors")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === "donors" 
                                ? "border-blue-600 text-blue-600" 
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        Donor Directory
                    </button>
                    <button
                        onClick={() => setActiveTab("new_entry")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === "new_entry" 
                                ? "border-blue-600 text-blue-600" 
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        New Entry
                    </button>
                </nav>
            </div>

            {/* --- CONDITIONAL RENDERING --- */}
            {/* React will instantly swap out the UI below based on the active tab */}
            
            <div className="transition-opacity duration-300">
                {activeTab === "transactions" && <TransactionsView />}
                {activeTab === "donors" && <DonorsDirectoryView />}
                {activeTab === "new_entry" && <DonationEntryForm />}
            </div>

        </div>
    );
}