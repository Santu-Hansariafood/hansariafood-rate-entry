"use client";

import React, { useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import { useCommodityList } from "@/hooks/Commodity/useCommodityList";

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
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { loading: () => <Loading /> }
);
const SearchBox = dynamic(
  () => import("@/components/common/SearchBox/SearchBox"),
  { loading: () => <Loading /> }
);

const CommodityList = () => {
  const {
    commodities,
    selectedCommodity,
    modal,
    currentPage,
    totalEntries,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleEdit,
    handleDelete,
    openModal,
    closeModal,
    handleView,
  } = useCommodityList();

  const [editName, setEditName] = useState("");

  const columns = useMemo(
    () => [
      { header: "Sl No", accessor: "slno" },
      { header: "Commodity Name", accessor: "name" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      commodities.map((commodity, index) => ({
        slno: (currentPage - 1) * 10 + index + 1,
        name: commodity.name,
        actions: (
          <Actions
            key={commodity._id}
            item={{
              title: commodity.name,
              id: commodity._id,
              onEdit: () => {
                setEditName(commodity.name);
                openModal("edit", { ...commodity, index });
              },
              onDelete: () => openModal("delete", { ...commodity, index }),
              onView: () => handleView(commodity),
            }}
          />
        ),
      })),
    [commodities, openModal, handleView, currentPage]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 dark:bg-gray-900 min-h-screen">
        <Title text="Commodity List" />
        <SearchBox
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          placeholder="Search commodities..."
        />
        <Table data={data} columns={columns} />
        <Pagination
          totalItems={totalEntries}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {selectedCommodity && (
          <div className="mt-4 p-4 bg-gray-100 rounded dark:bg-gray-800 dark:text-gray-200">
            <h3 className="text-lg font-semibold">Commodity Details</h3>
            <p>
              <strong>Name:</strong> {selectedCommodity.name}
            </p>
          </div>
        )}

        {modal.open && (
          <Modal onClose={closeModal}>
            {modal.type === "edit" && (
              <div className="dark:bg-gray-900 dark:text-gray-200">
                <h2 className="text-lg font-semibold mb-4">Edit Commodity</h2>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded bg-white dark:bg-gray-800 dark:text-gray-200"
                />
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => handleEdit(modal.data.index, editName)}
                >
                  Save Changes
                </button>
              </div>
            )}

            {modal.type === "delete" && (
              <div className="dark:bg-gray-900 dark:text-gray-200">
                <h2 className="text-lg font-semibold mb-4">Delete Commodity</h2>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{modal.data.name}</strong>?
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded"
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

export default CommodityList;
