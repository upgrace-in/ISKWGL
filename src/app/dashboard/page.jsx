"use client";
export const dynamic = 'force-dynamic'; // <-- ADD THIS LINE
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import TransactionsView from "@/Components/TransactionsView";
import DonorsDirectoryView from "@/Components/DonorsDirectoryView";
import DonationEntryForm from "@/Components/DonationEntryForm";
import AdminUsersManagement from "@/Components/AdminUsersManagement";

export default function UnifiedDashboard() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const role = session?.user?.role;

  // State to track which view is currently selected
  const [activeTab, setActiveTab] = useState("transactions");

  // Redirect users away from restricted tabs if they lack permissions
  useEffect(() => {
    const isManagerOrAdmin = role === "admin" || role === "manager";
    if (!isManagerOrAdmin && activeTab === "new_entry") {
      setActiveTab("transactions");
    }
    if (role !== "admin" && activeTab === "manage_users") {
      setActiveTab("transactions");
    }
  }, [role, activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* --- HEADER WITH LOGOUT BUTTON --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ISKCON Warangal Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as: <span className="font-semibold text-gray-800">{session?.user?.email}</span>
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* --- TAB NAVIGATION UI --- */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Transactions
          </button>

          <button
            onClick={() => setActiveTab("donors")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "donors"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Donor Directory
          </button>

          {/* --- Manager & Admin Tab: New Entry --- */}
          {(role === "admin" || role === "manager") && (
            <button
              onClick={() => setActiveTab("new_entry")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "new_entry"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              New Entry
            </button>
          )}

          {/* --- Admin Only Tab: Manage Devotee Roles --- */}
          {role === "admin" && (
            <button
              onClick={() => setActiveTab("manage_users")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "manage_users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Manage Devotee Roles
            </button>
          )}
        </nav>
      </div>

      {/* --- CONDITIONAL RENDERING --- */}
      <div className="transition-opacity duration-300">
        {activeTab === "transactions" && <TransactionsView role={role} />}
        {activeTab === "donors" && <DonorsDirectoryView />}
        {activeTab === "new_entry" && (role === "admin" || role === "manager") && <DonationEntryForm />}
        {activeTab === "manage_users" && role === "admin" && <AdminUsersManagement />}
      </div>
    </div>
  );
}