"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useCategories from "@/hooks/Category/useCategories";

const Title = dynamic(() => import("@/components/common/Title/Title"), { loading: () => <Loading /> });
const Table = dynamic(() => import("@/components/common/Tables/Tables"), { loading: () => <Loading /> });
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), { loading: () => <Loading /> });
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), { loading: () => <Loading /> });
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"), { loading: () => <Loading /> });

const CategoryList = () => {
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    categories,
    totalEntries,
    currentPage,
    setCurrentPage,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const openModal = useCallback((type, data = null) => {
    setModal({ open: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, type: "", data: null });
  }, []);

  const handleView = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleEdit = useCallback(
    (index, newName) => {
      updateCategory(index, newName).then(closeModal);
    },
    [updateCategory, closeModal]
  );

  const handleDelete = useCallback(
    (index) => {
      deleteCategory(index).then(closeModal);
    },
    [deleteCategory, closeModal]
  );

  const columns = useMemo(
    () => [
      { header: "Sl No", accessor: "slno" },
      { header: "Category Name", accessor: "name" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      categories.map((category, index) => ({
        slno: (currentPage - 1) * 10 + index + 1,
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
      })),
    [categories, openModal, handleView, currentPage]
  );

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
          <div className="mt-4 p-4 bg-gray-100 rounded dark:bg-gray-800 dark:text-white">
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
                  className="border p-2 w-full mb-4 rounded"
                  id="editCategoryInput"
                />
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
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
