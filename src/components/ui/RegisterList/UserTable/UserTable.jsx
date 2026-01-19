"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Eye, Layers, X, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { NAV_CONFIG, RATE_DROPDOWN, COMPANY_DROPDOWN } from "@/config/navigation";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Table = dynamic(() => import("@/components/common/Tables/Tables"));

export default function UserTable({
  users,
  handleOpenPopup,
  handleDeleteUser,
  onView,
}) {
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const allPages = [
    ...NAV_CONFIG,
    ...RATE_DROPDOWN,
    ...COMPANY_DROPDOWN,
  ].reduce((acc, item) => {
    const id = item.key || item.path;
    if (id && !acc.find((p) => (p.key || p.path) === id)) {
      acc.push(item);
    }
    return acc;
  }, []);

  const handleManagePages = (user) => {
    setCurrentUser(user);
    setSelectedPages(user.pages || []);
    setPageModalOpen(true);
  };

  const togglePage = (id) => {
    setSelectedPages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const savePages = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await axiosInstance.put("/auth/register", {
        mobile: currentUser.mobile,
        pages: selectedPages,
      });
      setPageModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to update pages");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Mobile", accessor: "mobile" },
    { header: "Action", accessor: "action" },
    { header: "Pages", accessor: "pages" },
  ];

  const safeUsers = Array.isArray(users) ? users : [];

  const usersWithActions = safeUsers.map((user) => ({
    ...user,

    action: (
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleManagePages(user)}
          className="px-3 py-1 rounded-lg flex items-center gap-2
                     bg-indigo-500 dark:bg-indigo-600 
                     text-white hover:bg-indigo-600 dark:hover:bg-indigo-700 
                     transition-colors"
        >
          <Layers size={16} />
          Pages
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenPopup(user)}
          className="px-3 py-1 rounded-lg flex items-center gap-2
                     bg-blue-500 dark:bg-blue-600 
                     text-white hover:bg-blue-600 dark:hover:bg-blue-700 
                     transition-colors"
        >
          <Plus size={16} />
          Add Company
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDeleteUser(user._id)}
          className="px-3 py-1 rounded-lg flex items-center gap-2
                     bg-red-500 dark:bg-red-600 
                     text-white hover:bg-red-600 dark:hover:bg-red-700 
                     transition-colors"
        >
          <Trash2 size={16} />
          Remove
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onView(user)}
          className="px-3 py-1 rounded-lg flex items-center gap-2
                     bg-green-500 dark:bg-green-600 
                     text-white hover:bg-green-600 dark:hover:bg-green-700 
                     transition-colors"
        >
          <Eye size={16} />
          View
        </motion.button>
      </div>
    ),

    pages: Array.isArray(user.pages) && user.pages.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {user.pages.map((page) => {
          const found = allPages.find((p) => (p.key || p.path) === page);
          return (
            <span
              key={page}
              className="px-2 py-0.5 text-xs rounded-md
                         bg-indigo-100 text-indigo-700
                         dark:bg-indigo-900 dark:text-indigo-300"
            >
              {found ? found.label : page}
            </span>
          );
        })}
      </div>
    ) : (
      <span className="text-gray-400 text-sm">—</span>
    ),
  }));

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow 
                   text-gray-900 dark:text-gray-100 transition-colors"
      >
        <Table data={usersWithActions} columns={columns} />
      </div>

      <AnimatePresence>
        {pageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setPageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Pages for {currentUser?.name}
                </h3>
                <button
                  onClick={() => setPageModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allPages.map((item) => {
                    const id = item.key || item.path;
                    const isSelected = selectedPages.includes(id);
                    return (
                      <div
                        key={id}
                        onClick={() => togglePage(id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                          ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                          }`}
                      >
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                          {item.label}
                        </span>
                        {isSelected && (
                          <Check size={16} className="text-emerald-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setPageModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePages}
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
