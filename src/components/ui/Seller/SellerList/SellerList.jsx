"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));
const Modal = dynamic(() => import("@/components/common/Modal/Modal"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"));
const Pagination = dynamic(() => import("@/components/common/Pagination/Pagination"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));

export default function SellerList() {
  const [sellers, setSellers] = useState([]);
  const [totalSellers, setTotalSellers] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [formData, setFormData] = useState({ sellerName: "", companies: [] });

  // fetch all sellers for current page from server (server-side pagination)
  const fetchSellers = async (page = currentPage, query = searchQuery) => {
    try {
      const res = await axiosInstance.get(
        `/seller?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(query)}`
      );
      if (res.data && Array.isArray(res.data.sellers)) {
        const processedSellers = res.data.sellers.map((seller) => {
          let processedCompanies = [];

          if (seller.companies && Array.isArray(seller.companies)) {
            if (typeof seller.companies[0] === "string") {
              processedCompanies = seller.companies.map((name) => ({ name }));
            } else if (typeof seller.companies[0] === "object") {
              processedCompanies = seller.companies.map((company) => {
                if (company.name) {
                  return { name: company.name };
                } else if (company.companyId) {
                  const matchingCompany = companies.find((c) => c._id === company.companyId);
                  return { name: matchingCompany?.name || "Unknown" };
                }
                return { name: "Unknown" };
              });
            }
          }

          return { ...seller, companies: processedCompanies };
        });

        setSellers(processedSellers);
        setTotalSellers(res.data.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sellers");
    }
  };

  // fetch companies (names for Dropdown)
  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get("/companies?limit=all");
      if (res.data && Array.isArray(res.data.companies)) {
        const sellerCompanies = res.data.companies.filter(
          (c) => Array.isArray(c.type) && c.type.includes("seller")
        );

        const sortedCompanies = sellerCompanies.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
        setCompanies(sortedCompanies);
        setCompanyOptions(
          sortedCompanies.map((c) => ({
            label: c?.name || "Unknown",
            value: c?.name || "Unknown",
          }))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load companies");
    }
  };

  // initial load
  useEffect(() => {
    const init = async () => {
      await fetchCompanies();
      await fetchSellers(1, searchQuery);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when page or search changes
  useEffect(() => {
    fetchSellers(currentPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const handlePageChange = (page) => setCurrentPage(page);

  // open modal with names pre-filled
  const handleEdit = (seller) => {
    setEditMode(true);
    setSelectedSeller(seller);

    const companyNames = seller?.companies?.map((c) => c?.name).filter(Boolean) || [];

    setFormData({
      sellerName: seller?.sellerName || "",
      companies: companyNames,
    });

    setModalOpen(true);
  };

  const handleView = (seller) => {
    setEditMode(false);
    setSelectedSeller(seller);
    setModalOpen(true);
  };

  // adjust page after delete when needed
  const refreshAfterDelete = async () => {
    const newTotal = Math.max(0, (totalSellers || 0) - 1);
    const newTotalPages = Math.max(1, Math.ceil(newTotal / ITEMS_PER_PAGE));
    const nextPage = Math.min(currentPage, newTotalPages);
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
      // fetch will run via useEffect
    } else {
      await fetchSellers(nextPage, searchQuery);
    }
  };

  const handleDelete = async (seller) => {
    try {
      await axiosInstance.delete(`/seller/${seller._id}`);
      toast.success("Seller deleted");
      await refreshAfterDelete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete seller");
    }
  };

  // save edits and refresh current page
  const handleSaveEdit = async () => {
    try {
      const payload = {
        sellerName: formData.sellerName.trim(),
        companies: formData.companies,
      };

      await axiosInstance.put(`/seller/${selectedSeller._id}`, payload);
      toast.success("Seller updated");
      setModalOpen(false);
      await fetchSellers(currentPage, searchQuery);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update seller");
    }
  };

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
              onChange={(e) => {
                setCurrentPage(1);
                setSearchQuery(e.target.value);
              }}
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
                <>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Edit Seller
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block font-semibold mb-2">Seller Name</label>
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
                      <label className="block font-semibold mb-2">Companies</label>
                      <Dropdown
                        options={companyOptions}
                        value={formData.companies}
                        onChange={(val) => setFormData({ ...formData, companies: val })}
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
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">{selectedSeller?.sellerName || "Unknown Seller"}</h2>
                  <p className="text-sm mb-2 font-semibold">Companies:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedSeller?.companies
                      ?.slice()
                      ?.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                      ?.map((c, i) => <li key={i}>{c?.name || "Unknown"}</li>)}
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
