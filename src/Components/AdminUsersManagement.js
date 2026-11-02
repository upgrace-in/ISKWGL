"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminUsersManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  // Add new user or update via form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ text: `Successfully saved access for ${name} (${email})`, type: "success" });
      setName("");
      setEmail("");
      setRole("viewer");
      fetchUsers();
    } else {
      setMessage({ text: data.error || "Failed to assign role.", type: "error" });
    }
  };

  // Trigger Modal for Role Change
  const handleRoleChangeTrigger = (targetName, targetEmail, currentRole, newRole, event) => {
    setModalConfig({
      isOpen: true,
      title: "Confirm Role Change",
      message: `Are you sure you want to change the role for ${targetName}(${targetEmail}) from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`,
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        await executeRoleChange(targetEmail, newRole);
      },
      onCancel: () => {
        event.target.value = currentRole; // Revert dropdown selection
        setModalConfig({ isOpen: false });
      },
    });
  };

  const executeRoleChange = async (targetEmail, newRole) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    const targetUser = users.find((u) => u.email === targetEmail);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: targetUser?.name || "User", email: targetEmail, role: newRole }),
    });

    if (res.ok) {
      setMessage({ text: `Updated role for ${targetEmail} to ${newRole.toUpperCase()}`, type: "success" });
      fetchUsers();
    } else {
      setMessage({ text: "Failed to update role.", type: "error" });
    }
    setLoading(false);
  };

  // Trigger Modal for Revoke Access
  const handleDeleteTrigger = (targetEmail) => {
    setModalConfig({
      isOpen: true,
      title: "Revoke User Access",
      message: `Are you sure you want to revoke access for ${targetEmail}? They will no longer be able to log in to the dashboard.`,
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        await executeDelete(targetEmail);
      },
      onCancel: () => setModalConfig({ isOpen: false }),
    });
  };

  const executeDelete = async (targetEmail) => {
    setMessage({ text: "", type: "" });
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ text: `Revoked access for ${targetEmail}`, type: "success" });
      fetchUsers();
    } else {
      setMessage({ text: data.error || "Failed to delete user.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* --- CUSTOM MODAL POPUP --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{modalConfig.title}</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{modalConfig.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={modalConfig.onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalConfig.onConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / UPDATE FORM --- */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add or Update Devotee Access</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Devotee Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              required
              className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="donor_care">Friend Raiser</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Save Access
          </button>
        </form>

        {message.text && (
          <p
            className={`mt-4 text-sm font-medium p-2.5 rounded ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* --- USER ROLES TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Assigned Role
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => {
              const isCurrentUser = u.email?.toLowerCase() === session?.user?.email?.toLowerCase();

              return (
                <tr key={u._id || u.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {u.name || "No Name Provided"}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-normal">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      defaultValue={u.role}
                      disabled={loading || isCurrentUser}
                      onChange={(e) => handleRoleChangeTrigger(u.name, u.email, u.role, e.target.value, e)}
                      className="p-1.5 border border-gray-300 rounded font-semibold text-xs uppercase bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="friend_raiser">Friend Raiser</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteTrigger(u.email)}
                      disabled={isCurrentUser}
                      className="text-red-600 hover:text-red-900 font-medium text-xs border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Revoke Access
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}