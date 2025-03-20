"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Button = dynamic(() => import("@/components/common/Button/Button"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));

export default function CreateCompany() {
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!company.trim() || !category) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await axios.post("/api/companies", {
        name: company,
        category,
      });

      if (response.status === 201) {
        toast.success("Company saved successfully");
        setCompany("");
        setCategory("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save company";
      toast.error(errorMessage);
    }
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
          <Title text="Create Company" />
          <InputBox
            label="Company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name"
          />
          <Dropdown
            label="Category"
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.name,
            }))}
            value={category}
            onChange={(val) => setCategory(val)}
          />
          <Button onClick={handleSave} text="Save" />
        </div>
      </div>
    </Suspense>
  );
}
