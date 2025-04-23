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
  } = useCompanyList();

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Actions", accessor: "actions" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Company List" />
        <Table
          data={paginatedData.map((item) => ({
            ...item,
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
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 text-white mt-4 px-4 py-2 rounded-lg"
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
              </>
            )}
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default CompanyList;
