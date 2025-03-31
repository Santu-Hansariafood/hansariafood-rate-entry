"use client";
import React, { useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";

const Actions = ({ item }) => {
  const [modal, setModal] = useState({ open: false, type: "" });

  const openModal = (type) => setModal({ open: true, type });
  const closeModal = () => setModal({ open: false, type: "" });

  const handleAction = () => {
    switch (modal.type) {
      case "view":
        item.onView(item.id);
        break;
      case "edit":
        item.onEdit(item);
        break;
      case "delete":
        item.onDelete(item.id);
        break;
      default:
        break;
    }
    closeModal();
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => openModal("view")}
        className="text-green-600 hover:text-green-800"
      >
        <Eye size={20} />
      </button>
      <button
        onClick={() => openModal("edit")}
        className="text-blue-600 hover:text-blue-800"
      >
        <Edit size={20} />
      </button>
      <button
        onClick={() => openModal("delete")}
        className="text-red-600 hover:text-red-800"
      >
        <Trash2 size={20} />
      </button>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4 capitalize">
              {modal.type} Item
            </h2>
            <p className="text-gray-700 mb-4">
              {modal.type === "view"
                ? item.title
                : `Are you sure you want to ${modal.type} this item?`}
            </p>
            {modal.type !== "view" && (
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded text-gray-700 bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 rounded text-white ${
                    modal.type === "delete" ? "bg-red-600" : "bg-blue-600"
                  } hover:bg-opacity-80`}
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
