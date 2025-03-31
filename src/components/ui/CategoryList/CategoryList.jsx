"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));
const Modal = dynamic(() => import("@/components/common/Modal/Modal"));

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modal, setModal] = useState({ open: false, type: "", data: null });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories");
      }
    };
    fetchCategories();
  }, []);

  const handleEdit = async (id, newName) => {
    try {
      const response = await axios.put(`/api/categories/${id}`, {
        name: newName,
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id ? { ...cat, name: response.data.category.name } : cat
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error updating category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      closeModal();
    } catch (error) {
      console.error("Error deleting category");
    }
  };

  const handleView = (category) => {
    setSelectedCategory(category);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
  };

  const columns = [
    { header: "Category Name", accessor: "name" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = categories.map((category) => ({
    name: category.name,
    actions: (
      <Actions
        item={{
          id: category._id,
          title: category.name,
          onEdit: () => openModal("edit", category),
          onDelete: () => openModal("delete", category),
          onView: () => handleView(category),
        }}
      />
    ),
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Category List" />
        <Table data={data} columns={columns} />

        {selectedCategory && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Category Details</h3>
            <p>Name: {selectedCategory.name}</p>
          </div>
        )}

        {modal.open && (
          <Modal onClose={closeModal}>
            {modal.type === "edit" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
                <input
                  type="text"
                  defaultValue={modal.data.name}
                  className="border p-2 w-full mb-4"
                  id="editCategoryInput"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() =>
                    handleEdit(
                      modal.data._id,
                      document.getElementById("editCategoryInput").value
                    )
                  }
                >
                  Save Changes
                </button>
              </div>
            )}
            {modal.type === "delete" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Delete Category</h2>
                <p>Are you sure you want to delete {modal.data.name}?</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(modal.data._id)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default CategoryList;
