"use client";

import React, { useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { useCommodityList } from "@/hooks/Commodity/useCommodityList";

const Title = dynamic(() => import("@/components/common/Title/Title"), { loading: () => <Loading /> });
const Table = dynamic(() => import("@/components/common/Tables/Tables"), { loading: () => <Loading /> });
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), { loading: () => <Loading /> });
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), { loading: () => <Loading /> });
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"), { loading: () => <Loading /> });

const CommodityList = () => {
  const {
    commodities,
    selectedCommodity,
    modal,
    currentPage,
    totalEntries,
    setCurrentPage,
    handleEdit,
    handleDelete,
    openModal,
    closeModal,
    handleView,
  } = useCommodityList();

  const [editName, setEditName] = useState("");
  const [editSubCategories, setEditSubCategories] = useState([]);

  const columns = useMemo(
    () => [
      { header: "Commodity Name", accessor: "name" },
      { header: "Sub-Categories", accessor: "subCategories" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );
  
  const data = useMemo(
    () =>
      commodities.map((commodity, index) => ({
        name: commodity.name,
        subCategories: (commodity.subCategories || []).join(", "),
        actions: (
          <Actions
            key={commodity._id}
            item={{
              title: commodity.name,
              id: commodity._id,
              onEdit: () => {
                setEditName(commodity.name);
                setEditSubCategories(commodity.subCategories || []);
                openModal("edit", { ...commodity, index });
              },
              onDelete: () => openModal("delete", { ...commodity, index }),
              onView: () => handleView(commodity),
            }}
          />
        ),
      })),
    [commodities, openModal, handleView]
  );
  
  const handleSubCategoryChange = (index, value) => {
    const updated = [...editSubCategories];
    updated[index] = value;
    setEditSubCategories(updated);
  };

  const addSubCategory = () => {
    setEditSubCategories([...editSubCategories, ""]);
  };

  const removeSubCategory = (index) => {
    const updated = [...editSubCategories];
    updated.splice(index, 1);
    setEditSubCategories(updated);
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Commodity List" />
        <Table data={data} columns={columns} />

        <Pagination
          totalItems={totalEntries}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {selectedCommodity && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Commodity Details</h3>
            <p><strong>Name:</strong> {selectedCommodity.name}</p>
            {selectedCommodity.subCategories?.length > 0 && (
              <div>
                <strong>Sub-Categories:</strong>
                <ul className="list-disc pl-5">
                  {selectedCommodity.subCategories.map((sub, i) => (
                    <li key={i}>{sub}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {modal.open && (
          <Modal onClose={closeModal}>
            {modal.type === "edit" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Edit Commodity</h2>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-2 w-full mb-4"
                />

                <div>
                  <label className="font-semibold">Sub-Categories:</label>
                  {editSubCategories.map((sub, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={sub}
                        onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                        className="border p-2 w-full mr-2"
                      />
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeSubCategory(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSubCategory}
                    className="text-blue-500 text-sm underline mt-2"
                  >
                    + Add Sub-Category
                  </button>
                </div>

                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() =>
                    handleEdit(modal.data.index, editName, editSubCategories)
                  }
                >
                  Save Changes
                </button>
              </div>
            )}

            {modal.type === "delete" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Delete Commodity</h2>
                <p>Are you sure you want to delete <strong>{modal.data.name}</strong>?</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeModal}>
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

export default CommodityList;
