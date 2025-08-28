"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useSellerList from "@/hooks/TopSaudaList/useSellerList";
import useSaudaDetails from "@/hooks/TopSaudaList/useSaudaDetails";
import useSellerSearch from "@/hooks/TopSaudaList/useSellerSearch";
import usePagination from "@/hooks/TopSaudaList/usePagination";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Pagination = dynamic(() =>
  import("@/components/common/Pagination/Pagination")
);
const SellerList = dynamic(() => import("./SellerList/SellerList"));
const SaudaDetails = dynamic(() => import("./SaudaDetails/SaudaDetails"));

const TopSaudaList = () => {
  const { sellers } = useSellerList();
  const {
    saudaDetails,
    selectedSeller,
    loading,
    fetchSaudaDetails,
    setSelectedSeller,
    setSaudaDetails,
  } = useSaudaDetails();

  const {
    searchTerm,
    setSearchTerm,
    filteredSellers,
    searchCount,
    totalCount,
  } = useSellerSearch(sellers);

  const { currentPage, goToPage, resetToFirstPage } = usePagination(10);

  const handleSellerClick = async (sellerName) => {
    resetToFirstPage();
    await fetchSaudaDetails(sellerName, 1);
  };

  const handleClearSelection = () => {
    setSelectedSeller(null);
    setSaudaDetails(null);
    resetToFirstPage();
  };

  const handlePageChange = async (page) => {
    if (selectedSeller) {
      await fetchSaudaDetails(selectedSeller, page);
      goToPage(page);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Title text="Seller Dashboard" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <SellerList
              sellers={filteredSellers}
              selectedSeller={selectedSeller}
              sellerSearch={searchTerm}
              onSellerSearch={setSearchTerm}
              onSellerClick={handleSellerClick}
              searchCount={searchCount}
              totalCount={totalCount}
            />

            <SaudaDetails
              selectedSeller={selectedSeller}
              saudaDetails={saudaDetails}
              loading={loading}
              onClearSelection={handleClearSelection}
            />
          </div>

          {selectedSeller && saudaDetails && (
            <Pagination
              currentPage={currentPage}
              totalItems={saudaDetails.total || 0}
              itemsPerPage={10}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default TopSaudaList;
