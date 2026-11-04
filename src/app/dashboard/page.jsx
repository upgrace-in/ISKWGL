"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from "react";
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

  // Track which tabs have been opened at least once to prevent 0x0 chart warnings
  const [visitedTabs, setVisitedTabs] = useState({ transactions: true });

  // Ref to store independent scroll positions for each tab
  const scrollPositions = useRef({});

  // Handle switching tabs while saving scroll positions and tracking visits
  const handleTabChange = (newTab) => {
    // 1. Save current scroll position of the active tab before leaving
    scrollPositions.current[activeTab] = window.scrollY;
    
    // 2. Mark the new tab as visited so its components mount properly
    setVisitedTabs((prev) => ({ ...prev, [newTab]: true }));

    // 3. Switch to the new tab
    setActiveTab(newTab);
  };

  // Restore the scroll position of the newly selected tab after switching
  useEffect(() => {
    const savedPosition = scrollPositions.current[activeTab] || 0;
    window.scrollTo({ top: savedPosition, behavior: "instant" });
  }, [activeTab]);

  // Redirect users away from restricted tabs if they lack permissions
  useEffect(() => {
    const isManagerOrAdmin = role === "admin" || role === "manager";
    if (!isManagerOrAdmin && activeTab === "new_entry") {
      handleTabChange("transactions");
    }
    if (role !== "admin" && activeTab === "manage_users") {
      handleTabChange("transactions");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* --- NORMAL SCROLLING HEADER WITH LOGOUT BUTTON --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4 mb-0">
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

      {/* --- STICKY TAB NAVIGATION BAR --- */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange("transactions")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Transactions
          </button>

          <button
            onClick={() => handleTabChange("donors")}
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
              onClick={() => handleTabChange("new_entry")}
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
              onClick={() => handleTabChange("manage_users")}
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

      {/* --- CONDITIONAL RENDERING (Lazy Load + Preserved State & Scroll) --- */}
      <div className="transition-opacity duration-300 py-6">
        <div className={activeTab === "transactions" ? "block" : "hidden"}>
          <TransactionsView role={role} />
        </div>

        {visitedTabs.donors && (
          <div className={activeTab === "donors" ? "block" : "hidden"}>
            <DonorsDirectoryView />
          </div>
        )}

        {(role === "admin" || role === "manager") && visitedTabs.new_entry && (
          <div className={activeTab === "new_entry" ? "block" : "hidden"}>
            <DonationEntryForm />
          </div>
        )}

        {role === "admin" && visitedTabs.manage_users && (
          <div className={activeTab === "manage_users" ? "block" : "hidden"}>
            <AdminUsersManagement />
          </div>
        )}
      </div>
    </div>
  );
}