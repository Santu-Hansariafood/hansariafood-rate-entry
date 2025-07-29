"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, Eye } from "lucide-react";
import dynamic from "next/dynamic";

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
          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Company
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDeleteUser(user._id)}
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          Remove
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onView(user)}
          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Eye size={16} />
          View
        </motion.button>
      </div>
    ),
  }));

  return <Table data={usersWithActions} columns={columns} />;
}
