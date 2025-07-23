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
      <div className="p-4 space-y-4">
        <Title text="Company List" />
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search company name..."
        />
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
  <label className="block text-sm font-medium mb-2">Type</label>
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
                  className="bg-blue-600 text-white mt-6 px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">{selectedCompany.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {selectedCompany.category}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Type: {selectedCompany.type}
                </p>
              </>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default CompanyList;
