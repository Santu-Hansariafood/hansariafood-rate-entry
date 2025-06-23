"use client";
import React, { useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";

const Actions = ({ item }) => {
  const [modal, setModal] = useState({ open: false, type: "" });

  const openModal = (type) => setModal({ open: true, type });
  const closeModal = () => setModal({ open: false, type: "" });

  const handleAction = () => {
    if (modal.type === "view") item.onView(item.id);
    else if (modal.type === "edit") item.onEdit(item);
    else if (modal.type === "delete") item.onDelete(item.id);
    closeModal();
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => openModal("view")}
        className="text-green-600 hover:text-green-800 transition-transform hover:scale-110"
        title="View"
      >
        <Eye size={20} />
      </button>
      <button
        onClick={() => openModal("edit")}
        className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"
        title="Edit"
      >
        <Edit size={20} />
      </button>
      <button
        onClick={() => openModal("delete")}
        className="text-red-600 hover:text-red-800 transition-transform hover:scale-110"
        title="Delete"
      >
        <Trash2 size={20} />
      </button>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl shadow-2xl p-6 relative transition-all">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
            >
              <X size={22} />
            </button>
            <h2 className="text-xl font-bold capitalize mb-4 text-gray-800 dark:text-white">
              {modal.type} Item
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {modal.type === "view"
                ? item.title
                : `Are you sure you want to ${modal.type} this item?`}
            </p>

            {modal.type !== "view" && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 rounded-lg text-white font-semibold shadow-sm transition ${
                    modal.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;
