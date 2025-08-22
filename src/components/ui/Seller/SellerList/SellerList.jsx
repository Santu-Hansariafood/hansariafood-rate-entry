"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import useSellerList from "@/hooks/Seller/useSellerList";
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
const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    loading: () => <Loading />,
  }
);
const SearchBox = dynamic(
  () => import("@/components/common/SearchBox/SearchBox"),
  {
    loading: () => <Loading />,
  }
);
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  {
    loading: () => <Loading />,
  }
);

export default function SellerList() {
  const {
    currentPage,
    totalSellers,
    ITEMS_PER_PAGE,
    paginatedData,
    modalOpen,
    selectedSeller,
    formData,
    editMode,
    handlePageChange,
    setModalOpen,
    handleSaveEdit,
    handleChange,
    searchQuery,
    setSearchQuery,
    handleEdit,
    handleView,
    handleDelete,
  } = useSellerList();

  const columns = [
    { header: "Sl No", accessor: "slno" },
    { header: "Seller Name", accessor: "sellerName" },
    { header: "Companies", accessor: "companies" },
    { header: "Actions", accessor: "actions" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
        <Title text="Seller List" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-green-100 dark:border-gray-700">
          <div className="w-full md:w-1/2">
            <SearchBox
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seller name..."
            />
          </div>
        </div>
        <Table
          data={paginatedData.map((item, index) => ({
            slno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
            sellerName: item.sellerName,
            companies: item.companies.join(", "),
            actions: (
              <Actions
                item={{
                  ...item,
                  id: item._id,
                  onEdit: handleEdit,
                  onView: handleView,
                  onDelete: handleDelete,
                }}
              />
            ),
          }))}
          columns={columns}
        />

        <Pagination
          currentPage={currentPage}
          totalItems={totalSellers}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />

        {modalOpen && selectedSeller && (
          <Modal onClose={() => setModalOpen(false)}>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg text-gray-900 dark:text-gray-100 w-full max-w-md">
              {editMode ? (
                <Suspense fallback={<Loading />}>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Edit Seller
                  </h2>
                  <div className="mb-5">
                    <label className="block font-semibold mb-2">
                      Seller Name
                    </label>
                    <InputBox
                      name="sellerName"
                      value={formData.sellerName}
                      onChange={handleChange}
                      placeholder="Enter seller name"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block font-semibold mb-2">
                      Companies
                    </label>
                    <div className="space-y-3">
                      {formData.companies.map((company, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <input
                            type="text"
                            className="border rounded-lg px-3 py-2 flex-1 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={company}
                            onChange={(e) => {
                              const updated = [...formData.companies];
                              updated[idx] = e.target.value;
                              handleChange({
                                target: { name: "companies", value: updated },
                              });
                            }}
                            placeholder={`Company ${idx + 1}`}
                          />
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            onClick={() => {
                              const updated = formData.companies.filter(
                                (_, i) => i !== idx
                              );
                              handleChange({
                                target: { name: "companies", value: updated },
                              });
                            }}
                            disabled={formData.companies.length === 1}
                            title="Remove"
                          >
                            ✕
                          </button>
                          {idx === formData.companies.length - 1 && (
                            <button
                              type="button"
                              className="text-green-500 hover:text-green-700 p-1 rounded"
                              onClick={() =>
                                handleChange({
                                  target: {
                                    name: "companies",
                                    value: [...formData.companies, ""],
                                  },
                                })
                              }
                              title="Add"
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </Suspense>
              ) : (
                <Suspense fallback={<Loading />}>
                  <h2 className="text-lg font-bold mb-2">
                    {selectedSeller.sellerName}
                  </h2>
                  <p className="text-sm mb-2">Companies:</p>
                  <ul className="list-disc list-inside mb-4">
                    {selectedSeller.companies.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </Suspense>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Suspense>
  );
}
