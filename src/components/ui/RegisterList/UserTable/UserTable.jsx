"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, Eye } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Table = dynamic(() => import("@/components/common/Tables/Tables"));

export default function UserTable({
  users,
  handleOpenPopup,
  handleDeleteUser,
  onView,
}) {
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Mobile", accessor: "mobile" },
    { header: "Action", accessor: "action" },
  ];

  const usersWithActions = users.map((user) => ({
    ...user,
    action: (
      <div className="flex flex-wrap gap-2">
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
  }));

  return (
    <Suspense fallback={<Loading />}>
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow 
                    text-gray-900 dark:text-gray-100 transition-colors"
    >
      <Table data={usersWithActions} columns={columns} />
    </div>
    </Suspense>
  );
}
