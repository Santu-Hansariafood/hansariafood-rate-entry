"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import useSellerForm from "@/hooks/Seller/useSellerForm";

const Button = dynamic(() => import("@/components/common/Button/Button"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));

const CreateSeller = () => {
  const {
    sellerName,
    setSellerName,
    companyOptions,
    selectedCompanies,
    setSelectedCompanies,
    handleSave,
    loading,
  } = useSellerForm();

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-3xl">
          <Title
            text="Create Seller"
            className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100"
          />

          <div className="space-y-4">
            <InputBox
              label="Seller Name"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            <Dropdown
              label="Select Companies"
              options={companyOptions}
              value={selectedCompanies}
              onChange={setSelectedCompanies}
              isMulti={true}
              placeholder="Search or select seller companies..."
            />
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={handleSave}
              text={loading ? "Saving..." : "Save"}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default CreateSeller;
