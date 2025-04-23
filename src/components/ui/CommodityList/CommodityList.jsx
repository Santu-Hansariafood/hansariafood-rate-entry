"use client";

import React, { useMemo, Suspense } from "react";
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
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"), {
  loading: () => <Loading />,
});

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

  const columns = useMemo(
    () => [
      { header: "Commodity Name", accessor: "name" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      commodities.map((commodity, index) => ({
        name: commodity.name,
        actions: (
          <Actions
            key={commodity._id}
            item={{
              title: commodity.name,
              id: commodity._id,
              onEdit: () => openModal("edit", { ...commodity, index }),
              onDelete: () => openModal("delete", { ...commodity, index }),
              onView: () => handleView(commodity),
            }}
          />
        ),
      })),
    [commodities, openModal, handleView]
  );

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
            <p>Name: {selectedCommodity.name}</p>
          </div>
        )}

        {modal.open && (
          <Modal onClose={closeModal}>
            {modal.type === "edit" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Edit Commodity</h2>
                <input
                  type="text"
                  defaultValue={modal.data.name}
                  className="border p-2 w-full mb-4"
                  id="editCommodityInput"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() =>
                    handleEdit(
                      modal.data.index,
                      document.getElementById("editCommodityInput").value
                    )
                  }
                >
                  Save Changes
                </button>
              </div>
            )}
            {modal.type === "delete" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Delete Commodity</h2>
                <p>Are you sure you want to delete {modal.data.name}?</p>
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
