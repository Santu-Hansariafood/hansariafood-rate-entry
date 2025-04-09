"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  loading: () => <Loading />,
});
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), {
  loading: () => <Loading />,
});
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"), {
  loading: () => <Loading />,
});

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchCategories = useCallback(async (page = 1) => {
    try {
      const response = await axios.get(`/api/categories?page=${page}&limit=10`);
      setCategories(response.data.categories || []);
      setTotalEntries(response.data.total);
    } catch (error) {
      console.error("Error fetching categories");
    }
  }, []);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [fetchCategories, currentPage]);

  const handleEdit = useCallback((index, newName) => {
    const id = categories[index]._id;
    axios
      .put(`/api/categories/${id}`, { name: newName })
      .then((res) => {
        const updated = [...categories];
        updated[index].name = res.data.category.name;
        setCategories(updated);
        closeModal();
      })
      .catch(() => console.error("Error updating category"));
  }, [categories]);

  const handleDelete = useCallback((index) => {
    const id = categories[index]._id;
    axios
      .delete(`/api/categories/${id}`)
      .then(() => {
        const updated = [...categories];
        updated.splice(index, 1);
        setCategories(updated);
        closeModal();
      })
      .catch(() => console.error("Error deleting category"));
  }, [categories]);

  const openModal = useCallback((type, data = null) => {
    setModal({ open: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, type: "", data: null });
  }, []);

  const handleView = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const columns = useMemo(() => [
    { header: "Category Name", accessor: "name" },
    { header: "Actions", accessor: "actions" },
  ], []);

  const data = useMemo(() =>
    categories.map((category, index) => ({
      name: category.name,
      actions: (
        <Actions
          key={category._id}
          item={{
            title: category.name,
            id: category._id,
            onEdit: () => openModal("edit", { ...category, index }),
            onDelete: () => openModal("delete", { ...category, index }),
            onView: () => handleView(category),
          }}
        />
      ),
    })), [categories, openModal, handleView]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Category List" />
        <Table data={data} columns={columns} />

        <Pagination
          totalItems={totalEntries}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

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
                      modal.data.index,
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
                    onClick={() => handleDelete(modal.data.index)}
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
