"use client";

import React, { Suspense, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";

const Button = dynamic(() => import("@/components/common/Button/Button"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));

const CreateSeller = () => {
  const [sellerName, setSellerName] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get("/companies?limit=all");

        if (res.data && Array.isArray(res.data.companies)) {
          // ✅ Only include companies with type including "seller"
          const sellerCompanies = res.data.companies.filter((c) =>
            Array.isArray(c.type) && c.type.includes("seller")
          );

          setCompanyOptions(
            sellerCompanies.map((c) => ({
              label: c.name,
              value: c._id, // better to use _id as value instead of name
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        toast.error("Failed to load companies");
      }
    };
    fetchCompanies();
  }, []);

  const handleSave = async () => {
    if (!sellerName.trim()) {
      toast.error("Seller name is required!");
      return;
    }
    if (selectedCompanies.length === 0) {
      toast.error("Please select at least one company!");
      return;
    }

    const payload = {
      sellerName,
      companies: selectedCompanies, // will be array of _ids
    };

    try {
      const res = await axiosInstance.post("/seller", payload);
      toast.success(res.data.message || "Seller created successfully!");
      setSellerName("");
      setSelectedCompanies([]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create seller");
    }
  };

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
              text="Save"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default CreateSeller;
