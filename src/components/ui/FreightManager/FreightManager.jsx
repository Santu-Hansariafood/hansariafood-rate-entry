"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useFreightManager } from "@/hooks/useFreightManager";
import Loading from "@/components/common/Loading/Loading";
const FreightHeader =dynamic(() => import("./components/FreightHeader"));
const CommodityTabs =dynamic(() => import("./components/CommodityTabs"));
const FreightForm =dynamic(() => import("./components/FreightForm"));
const FreightList =dynamic(() => import("./components/FreightList"));
const EditFreightModal =dynamic(() => import("./components/EditFreightModal"));
const ViewFreightModal =dynamic(() => import("./components/ViewFreightModal"));

export default function FreightManager() {
  const freightManager = useFreightManager();
  const {
    selectedCommodity,
    setSelectedCommodity,
    editingId,
    freights,
    pagination,
    setPagination,
    searchTerm,
    setSearchTerm,
    selectedCreator,
    setSelectedCreator,
    creators,
    viewingFreight,
    setViewingFreight,
    isEditModalOpen,
    handleEdit,
    handleDelete,
    resetForm,
  } = freightManager;

  return (
    <Suspense fallback={<Loading />}>
    <div className="w-full max-w-6xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
      <FreightHeader />

      <CommodityTabs 
        selectedCommodity={selectedCommodity} 
        setSelectedCommodity={setSelectedCommodity} 
        setPagination={setPagination} 
      />

      {!editingId && <FreightForm context={freightManager} />}

      <FreightList
        freights={freights}
        pagination={pagination}
        setPagination={setPagination}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCreator={selectedCreator}
        setSelectedCreator={setSelectedCreator}
        creators={creators}
        setViewingFreight={setViewingFreight}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      <EditFreightModal 
        isEditModalOpen={isEditModalOpen} 
        resetForm={resetForm} 
        freightManager={freightManager} 
      />

      <ViewFreightModal 
        viewingFreight={viewingFreight} 
        setViewingFreight={setViewingFreight} 
      />
    </div>
    </Suspense>
  );
}
