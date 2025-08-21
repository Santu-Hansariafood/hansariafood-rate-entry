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
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"), {
  loading: () => <Loading />,
});
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"), {
  loading: () => <Loading />,
});
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"), {
  loading: () => <Loading />,
});

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

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-green-100 dark:border-gray-700">
          <div className="w-full md:w-1/2">
            <SearchBox
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seller name..."
            />
          </div>
        </div>

        {/* Table */}
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


        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalSellers}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />

        {/* Modal */}
        {modalOpen && selectedSeller && (
          <Modal onClose={() => setModalOpen(false)}>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg text-gray-900 dark:text-gray-100 w-full max-w-md">
              {editMode ? (
                <>
                  <h2 className="text-lg font-bold mb-4">Edit Seller</h2>
                  <InputBox
                    label="Seller Name"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    placeholder="Seller Name"
                  />
                  <div className="mb-4">
                    <label className="block font-semibold mb-2">Companies</label>
                    {formData.companies.map((company, idx) => (
                      <div key={idx} className="flex items-center mb-2 gap-2">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 flex-1"
                          value={company}
                          onChange={e => {
                            const updated = [...formData.companies];
                            updated[idx] = e.target.value;
                            handleChange({ target: { name: 'companies', value: updated } });
                          }}
                          placeholder={`Company ${idx + 1}`}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => {
                            const updated = formData.companies.filter((_, i) => i !== idx);
                            handleChange({ target: { name: 'companies', value: updated } });
                          }}
                          disabled={formData.companies.length === 1}
                          title="Remove"
                        >
                          -
                        </button>
                        {idx === formData.companies.length - 1 && (
                          <button
                            type="button"
                            className="text-green-500 hover:text-green-700 px-2"
                            onClick={() => handleChange({ target: { name: 'companies', value: [...formData.companies, ''] } })}
                            title="Add"
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-6 px-4 py-2 rounded-lg w-full"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold mb-2">{selectedSeller.sellerName}</h2>
                  <p className="text-sm mb-2">Companies:</p>
                  <ul className="list-disc list-inside mb-4">
                    {selectedSeller.companies.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Suspense>
  );
}
