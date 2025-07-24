"use client";

import React, { useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useManageCompanyList from "@/hooks/ManageCompany/useManageCompanyList";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";

const EditCompanyForm = dynamic(
  () =>
    import("@/components/ui/ManageCompanyList/EditCompanyForm/EditCompanyForm"),
  { loading: () => <Loading /> }
);
const Table = dynamic(() => import("@/components/common/Tables/Tables"), {
  loading: () => <Loading />,
});
const Title = dynamic(() => import("@/components/common/Title/Title"), {
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
const Actions = dynamic(() => import("@/components/common/Actions/Actions"), {
  loading: () => <Loading />,
});

const ManageCompanyList = () => {
  const {
    companies,
    totalCompanies,
    loading,
    selectedCompany,
    editingCompany,
    showModal,
    setSelectedCompany,
    setEditingCompany,
    setShowModal,
    searchQuery,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    fetchCompanies,
    handleSearchChange,
    typeFilter,
    setTypeFilter,
  } = useManageCompanyList();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    try {
      await axiosInstance.delete(`/managecompany/${id}`);
      toast.success("Company deleted");
      fetchCompanies();
    } catch {
      toast.error("Failed to delete company");
    }
  };

  const tableRows = useMemo(() => {
    const formatMobile = (m) => {
      const parts = [];
      if (m.primaryMobile) parts.push(`📱 ${m.primaryMobile}`);
      if (m.secondaryMobile) parts.push(`📞 ${m.secondaryMobile}`);
      if (m.contactPerson) parts.push(`👤 ${m.contactPerson}`);
      return parts.join(" | ");
    };

    return companies.map((row, index) => ({
      serial: <span>{(currentPage - 1) * itemsPerPage + index + 1}</span>,
      name: <strong>{row.name || "N/A"}</strong>,
      buyerSellerDisplay: (
        <span>
          {(row.type || [])
            .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
            .join(", ") || "N/A"}
        </span>
      ),
      locationDisplay: (
        <ul className="list-disc list-inside">
          {row.location.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      ),
      categoryDisplay: <span>{row.category || "N/A"}</span>,
      stateDisplay: <span>{row.state || "N/A"}</span>,
      commoditiesDisplay: (
        <ul className="list-disc list-inside">
          {row.commodities.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ),
      mobileNumbersDisplay: (
        <ul className="list-disc list-inside">
          {row.mobileNumbers.map((m, i) => (
            <li key={i}>
              {m.location && (
                <span className="font-medium">{m.location}: </span>
              )}
              {formatMobile(m)}
            </li>
          ))}
        </ul>
      ),
      actions: (
        <Actions
          item={{
            id: row._id,
            title: row.name,
            onView: () => {
              setSelectedCompany(row);
              setEditingCompany(null);
              setShowModal(true);
            },
            onEdit: () => {
              setEditingCompany(row);
              setSelectedCompany(null);
              setShowModal(true);
            },
            onDelete: () => handleDelete(row._id),
          }}
        />
      ),
    }));
  }, [companies, currentPage]);

  const columns = useMemo(
    () => [
      { header: "S.No", accessor: "serial" },
      { header: "Company Name", accessor: "name" },
      { header: "Type", accessor: "buyerSellerDisplay" },
      { header: "Locations", accessor: "locationDisplay" },
      { header: "Category", accessor: "categoryDisplay" },
      { header: "State", accessor: "stateDisplay" },
      { header: "Commodities", accessor: "commoditiesDisplay" },
      { header: "Mobile Numbers", accessor: "mobileNumbersDisplay" },
      { header: "Actions", accessor: "actions" },
    ],
    []
  );

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <ToastContainer position="top-right" autoClose={3000} />
        <Title text="Manage Company List" />

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-green-100">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="typeFilter"
              className="text-sm font-medium text-green-800"
            >
              Filter by Type:
            </label>
            <select
              id="typeFilter"
              className="bg-green-50 text-green-800 border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition duration-150"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-1/2">
            <SearchBox
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by company name..."
              className="w-full border border-green-300 bg-green-50 text-green-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition duration-150"
            />
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-hidden mt-4">
          <Table data={tableRows} columns={columns} />
          <Pagination
            currentPage={currentPage}
            totalItems={totalCompanies}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl overflow-y-auto max-h-[90vh]">
              {editingCompany ? (
                <EditCompanyForm
                  company={editingCompany}
                  onClose={() => {
                    setShowModal(false);
                    setEditingCompany(null);
                  }}
                  onUpdated={() => {
                    fetchCompanies();
                    setShowModal(false);
                    setEditingCompany(null);
                  }}
                />
              ) : selectedCompany ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Company Details</h2>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Name:</strong> {selectedCompany.name}
                    </li>
                    <li>
                      <strong>Category:</strong> {selectedCompany.category}
                    </li>
                    <li>
                      <strong>State:</strong> {selectedCompany.state}
                    </li>
                    <li>
                      <strong>Locations:</strong>
                      <ul className="list-disc ml-6">
                        {selectedCompany.location.map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <strong>Commodities:</strong>
                      <ul className="list-disc ml-6">
                        {selectedCompany.commodities.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <strong>Mobile Numbers:</strong>
                      <ul className="list-disc ml-6">
                        {selectedCompany.mobileNumbers.map((m, i) => (
                          <li key={i}>
                            {m.location && (
                              <span className="font-medium">
                                {m.location}:{" "}
                              </span>
                            )}
                            {m.primaryMobile && `📱 ${m.primaryMobile} `}
                            {m.secondaryMobile && `| 📞 ${m.secondaryMobile} `}
                            {m.contactPerson && `| 👤 ${m.contactPerson}`}
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCompany(null);
                    }}
                  >
                    Close
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default ManageCompanyList;
