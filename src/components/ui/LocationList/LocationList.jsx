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
const SearchBox = dynamic(
  () => import("@/components/common/SearchBox/SearchBox"),
  {
    loading: () => <Loading />,
  }
);

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
    locations,
    searchQuery,
    setSearchQuery,
  } = useLocationList();

  const ITEMS_PER_PAGE = 10;

  const columns = useMemo(
    () => [
      { header: "Sl No", accessor: "slno" },
      { header: "Location Name", accessor: "name" },
      { header: "State", accessor: "state" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  const data = useMemo(
    () =>
      locations.map((location, index) => ({
        slno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
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
    [locations, handleDelete, handleEditClick, handleView, currentPage]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 dark:bg-gray-900 min-h-screen">
        <Title text="Location List" />
        <SearchBox
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
        />
        <Table data={data} columns={columns} />
        <Pagination
          currentPage={currentPage}
          totalItems={totalEntries}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

        {showModal && (
          <Modal
            title={editMode ? "Edit Location" : "Location Details"}
            onClose={() => setShowModal(false)}
          >
            {editMode ? (
              <div className="space-y-4 p-4 dark:bg-gray-800 rounded-lg">
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200 font-semibold">
                    Location Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location name"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200 font-semibold">
                    State
                  </span>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm p-2 focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 dark:bg-gray-800 rounded-lg">
                <p className="dark:text-gray-200">
                  <strong>State:</strong> {selectedLocation?.state}
                </p>
                <p className="dark:text-gray-200">
                  <strong>Name:</strong> {selectedLocation?.name}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleDelete(selectedLocation._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
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
