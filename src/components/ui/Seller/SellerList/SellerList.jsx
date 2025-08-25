"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useSellerList from "@/hooks/Seller/useSellerList";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  suspense: true,
});
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  suspense: true,
});
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  suspense: true,
});
const Modal = dynamic(() => import("@/components/common/Modal/Modal"), {
  suspense: true,
});
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"), {
  suspense: true,
});
const SearchBox = dynamic(() =>
  import("@/components/common/SearchBox/SearchBox"), {
    suspense: true,
  }
);
const Pagination = dynamic(() =>
  import("@/components/common/Pagination/Pagination"), {
    suspense: true,
  }
);
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"), {
  suspense: true,
});

export default function SellerList() {
  const {
    sellers,
    totalSellers,
    companyOptions,
    currentPage,
    searchQuery,
    modalOpen,
    editMode,
    selectedSeller,
    formData,
    setFormData,
    setModalOpen,
    setSearchQuery,
    handlePageChange,
    handleEdit,
    handleView,
    handleDelete,
    handleSaveEdit,
    ITEMS_PER_PAGE,
  } = useSellerList();

  const columns = [
    { header: "Sl No", accessor: "slno" },
    { header: "Seller Name", accessor: "sellerName" },
    { header: "Companies", accessor: "companies" },
    { header: "Actions", accessor: "actions" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        <Title text="Seller List" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-green-100 dark:border-gray-700">
          <div className="w-full md:w-1/2">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search seller name..."
            />
          </div>
        </div>

        <Table
          data={sellers.map((item, index) => ({
            slno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
            sellerName: item?.sellerName || "Unknown",
            companies:
              item?.companies
                ?.slice()
                ?.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                ?.map((c) => c?.name || "Unknown")
                ?.join(", ") || "—",
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

        {modalOpen && (
          <Modal onClose={() => setModalOpen(false)}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md w-full max-w-lg mx-auto">
              {editMode ? (
                <Suspense fallback={<Loading />}>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Edit Seller
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block font-semibold mb-2">
                        Seller Name
                      </label>
                      <InputBox
                        name="sellerName"
                        value={formData.sellerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sellerName: e.target.value,
                          })
                        }
                        placeholder="Enter seller name"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">
                        Companies
                      </label>
                      <Dropdown
                        options={companyOptions}
                        value={formData.companies}
                        onChange={(val) =>
                          setFormData({ ...formData, companies: val })
                        }
                        isMulti={true}
                        placeholder="Select seller companies..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                  <h2 className="text-xl font-bold mb-4">
                    {selectedSeller?.sellerName || "Unknown Seller"}
                  </h2>
                  <p className="text-sm mb-2 font-semibold">Companies:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedSeller?.companies
                      ?.slice()
                      ?.sort((a, b) =>
                        (a?.name || "").localeCompare(b?.name || "")
                      )
                      ?.map((c, i) => (
                        <li key={i}>{c?.name || "Unknown"}</li>
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
