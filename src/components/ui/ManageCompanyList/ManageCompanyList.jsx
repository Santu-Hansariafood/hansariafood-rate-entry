"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import Actions from "@/components/common/Actions/Actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";

const EditCompanyForm = dynamic(() => import("./EditCompanyForm"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Pagination = dynamic(()=> import("@/components/common/Pagination/Pagination"));

const ManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/managecompany");
      const transformed = (response.data.companies || []).map((company) => ({
        ...company,
        location: Array.isArray(company.location) ? company.location : [],
        commodities: Array.isArray(company.commodities)
          ? company.commodities
          : [],
        subCommodities: Array.isArray(company.subCommodities)
          ? company.subCommodities
          : [],
        mobileNumbers: Array.isArray(company.mobileNumbers)
          ? company.mobileNumbers
          : [],
      }));
      setCompanies(transformed);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      toast.error("❌ Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleView = (company) => {
    setSelectedCompany(company);
    setEditingCompany(null);
    setShowModal(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setSelectedCompany(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    try {
      await axiosInstance.delete(`/managecompany/${id}`);
      toast.success("✅ Company deleted");
      fetchCompanies();
    } catch (error) {
      toast.error("❌ Failed to delete company");
    }
  };

  const formatMobileNumber = (mobile) => {
    if (!mobile) return null;
    const parts = [];
    if (mobile.primaryMobile) parts.push(`📱 ${mobile.primaryMobile}`);
    if (mobile.secondaryMobile) parts.push(`📞 ${mobile.secondaryMobile}`);
    if (mobile.contactPerson) parts.push(`👤 ${mobile.contactPerson}`);
    return parts.join(" | ");
  };

  const tableRows = useMemo(() => {
    return companies.map((row, index) => ({
      ...row,
      serial: <span>{index + 1}</span>,
      name: <span className="font-semibold">{row.name || "N/A"}</span>,
      locationDisplay: (
        <ul className="list-disc list-inside">
          {row.location.map((loc, idx) => (
            <li key={idx} className="text-sm">
              {loc || "N/A"}
            </li>
          ))}
        </ul>
      ),
      categoryDisplay: (
        <span className="text-gray-600">{row.category || "N/A"}</span>
      ),
      stateDisplay: (
        <span className="text-gray-600">{row.state || "N/A"}</span>
      ),
      commoditiesDisplay: (
        <ul className="list-disc list-inside">
          {row.commodities.map((cmd, idx) => (
            <li key={idx} className="text-sm">
              {cmd || "N/A"}
              {row.subCommodities[idx] && (
                <span className="text-gray-500 ml-2">
                  ({row.subCommodities[idx]})
                </span>
              )}
            </li>
          ))}
        </ul>
      ),
      mobileNumbersDisplay: (
        <ul className="list-disc list-inside">
          {row.mobileNumbers.map((mobile, idx) => {
            const formatted = formatMobileNumber(mobile);
            return formatted ? (
              <li key={idx} className="text-sm">
                {mobile.location && (
                  <span className="font-medium">{mobile.location}: </span>
                )}
                {formatted}
              </li>
            ) : null;
          })}
        </ul>
      ),
      actions: (
        <Actions
          item={{
            id: row._id,
            title: row.name,
            onView: () => handleView(row),
            onEdit: () => handleEdit(row),
            onDelete: () => handleDelete(row._id),
          }}
        />
      ),
    }));
  }, [companies]);

  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return tableRows.slice(startIdx, endIdx);
  }, [tableRows, currentPage]);

  const columns = useMemo(
    () => [
      { header: "S.No", accessor: "serial" },
      { header: "Company Name", accessor: "name" },
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table data={paginatedRows} columns={columns} />
          <Pagination
            currentPage={currentPage}
            totalItems={companies.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
              {editingCompany ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Edit Company</h2>
                  <EditCompanyForm
                    company={editingCompany}
                    onClose={() => {
                      setShowModal(false);
                      setEditingCompany(null);
                    }}
                    onSuccess={() => {
                      fetchCompanies();
                      toast.success("✅ Company updated");
                      setShowModal(false);
                      setEditingCompany(null);
                    }}
                  />
                </>
              ) : selectedCompany ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Company Details</h2>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {selectedCompany.name}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedCompany.category}
                    </p>
                    <p>
                      <strong>State:</strong> {selectedCompany.state}
                    </p>
                    <div>
                      <strong>Locations:</strong>
                      <ul className="list-disc ml-5">
                        {selectedCompany.location.map((loc, i) => (
                          <li key={i}>{loc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Commodities:</strong>
                      <ul className="list-disc ml-5">
                        {selectedCompany.commodities.map((c, i) => (
                          <li key={i}>
                            {c}
                            {selectedCompany.subCommodities[i] &&
                              ` (${selectedCompany.subCommodities[i]})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Mobile Numbers:</strong>
                      <ul className="list-disc ml-5">
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
                    </div>
                  </div>
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
