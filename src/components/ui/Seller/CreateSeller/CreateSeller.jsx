"use client";

import React, { Suspense, useState } from "react";
import { Plus, Minus } from "lucide-react"; // icons
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
const Button = dynamic(() => import("@/components/common/Button/Button"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Title = dynamic(() => import("@/components/common/Title/Title"));

const CreateSeller = () => {
  const [sellerName, setSellerName] = useState("");
  const [companies, setCompanies] = useState([{ id: Date.now(), name: "" }]);

  const handleCompanyChange = (id, value) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: value } : c))
    );
  };

  const addCompany = () => {
    setCompanies((prev) => [...prev, { id: Date.now(), name: "" }]);
  };

  const removeCompany = (id) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
  if (!sellerName.trim()) {
    toast.error("Seller name is required!");
    return;
  }
  if (companies.some((c) => !c.name.trim())) {
    toast.error("Please fill all company names!");
    return;
  }

  const payload = {
    sellerName,
    companies: companies.map((c) => c.name),
  };

  try {
    const res = await axiosInstance.post("/seller", payload);

    toast.success(res.data.message || "Seller created successfully!");
    setSellerName("");
    setCompanies([{ id: Date.now(), name: "" }]);
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.error || "Failed to create seller"
    );
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
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Companies
              </h3>
              <div className="space-y-3">
                {companies.map((company, index) => (
                  <div key={company.id} className="flex items-center gap-2">
                    <InputBox
                      label={`Company ${index + 1}`}
                      value={company.name}
                      onChange={(e) =>
                        handleCompanyChange(company.id, e.target.value)
                      }
                      className="dark:bg-gray-700 dark:text-gray-100 flex-1"
                    />
                    {companies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCompany(company.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Minus size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addCompany}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
