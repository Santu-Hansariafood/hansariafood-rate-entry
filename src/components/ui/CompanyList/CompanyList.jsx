"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import useCompanyList from "@/hooks/Company/useCompanyList";
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
    ssr: false,
    loading: () => <Loading />,
  }
);
const SearchBox = dynamic(
  () => import("@/components/common/SearchBox/SearchBox"),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);
const Pagination = dynamic(
  () => import("@/components/common/Pagination/Pagination"),
  {
    loading: () => <Loading />,
  }
);

const CompanyList = () => {
  const {
    currentPage,
    totalCompanies,
    ITEMS_PER_PAGE,
    paginatedData,
    modalOpen,
    selectedCompany,
    formData,
    editMode,
    handlePageChange,
    setModalOpen,
    handleSaveEdit,
    handleChange,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
  } = useCompanyList();

  const columns = [
    { header: "Sl No", accessor: "slno" },
    { header: "Company Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Type", accessor: "type" },
    { header: "Actions", accessor: "actions" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
        <Title text="Company List" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-green-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <label
              htmlFor="typeFilter"
              className="text-sm font-medium text-green-800 dark:text-green-300"
            >
              Filter by Type:
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <div className="w-full md:w-1/2">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search company name..."
            />
          </div>
        </div>
        <Table
          data={paginatedData.map((item, index) => ({
            slno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
            name: item.name,
            category: item.category,
            type: item.type,
            actions: <Actions item={item.actions} />,
          }))}
          columns={columns}
        />
        <Pagination
          currentPage={currentPage}
          totalItems={totalCompanies}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
        {modalOpen && selectedCompany && (
          <Modal onClose={() => setModalOpen(false)}>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg text-gray-900 dark:text-gray-100">
              {editMode ? (
                <>
                  <h2 className="text-lg font-bold mb-4">Edit Company</h2>
                  <InputBox
                    label="Company Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Company Name"
                  />
                  <InputBox
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Category"
                  />

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="type"
                          value="buyer"
                          checked={formData.type.includes("buyer")}
                          onChange={handleChange}
                          className="form-checkbox"
                        />
                        <span>Buyer</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="type"
                          value="seller"
                          checked={formData.type.includes("seller")}
                          onChange={handleChange}
                          className="form-checkbox"
                        />
                        <span>Seller</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-6 px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold">{selectedCompany.name}</h2>
                  <p className="text-sm mt-1">
                    Category: {selectedCompany.category}
                  </p>
                  <p className="text-sm mt-1">Type: {selectedCompany.type}</p>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default CompanyList;
