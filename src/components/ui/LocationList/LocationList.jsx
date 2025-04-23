"use client";

import React, { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useLocationList from "@/hooks/Location/useLocationList";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  loading: () => <Loading />,
});
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  { loading: () => <Loading /> }
);
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), {
  loading: () => <Loading />,
});

export default function LocationList() {
  const {
    states,
    showModal,
    setShowModal,
    editMode,
    selectedLocation,
    formData,
    handleEdit,
    handleDelete,
    handleEditClick,
    handleView,
    handleInputChange,
    currentPage,
    setCurrentPage,
    totalEntries,
    paginatedLocations,
  } = useLocationList();

  const columns = useMemo(
    () => [
      { header: "Location Name", accessor: "name" },
      { header: "State", accessor: "state" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      paginatedLocations.map((location) => ({
        name: location.name,
        state: location.state,
        actions: (
          <Actions
            item={{
              title: location.name,
              id: location._id,
              onView: () => handleView(location),
              onEdit: () => handleEditClick(location),
              onDelete: () => handleDelete(location._id),
            }}
          />
        ),
      })),
    [paginatedLocations, handleDelete, handleEditClick, handleView]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Location List" />
        <Table data={data} columns={columns} />
        <Pagination
          currentPage={currentPage}
          totalItems={totalEntries}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
        />

        {showModal && (
          <Modal
            title={editMode ? "Edit Location" : "Location Details"}
            onClose={() => setShowModal(false)}
          >
            {editMode ? (
              <div className="space-y-4 p-4">
                <label className="block">
                  <span className="text-gray-700 font-semibold">
                    Location Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    placeholder="Enter location name"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 font-semibold">State</span>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  >
                    <option value="" disabled>
                      Select a state
                    </option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p>
                  <strong>State:</strong> {selectedLocation?.state}
                </p>
                <p>
                  <strong>Name:</strong> {selectedLocation?.name}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleDelete(selectedLocation._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
}
