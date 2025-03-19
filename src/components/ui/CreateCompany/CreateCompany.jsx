"use client";

import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputBox from "@/components/common/InputBox/InputBox";
import Title from "@/components/common/Title/Title";
import Button from "@/components/common/Button/Button";

export default function CreateCompany() {
  const [company, setCompany] = useState("");

  const handleSave = async () => {
    if (!company.trim()) {
      toast.error("Company name cannot be empty");
      return;
    }

    try {
      const response = await axios.post("/api/companies", { name: company });

      if (response.status === 201) {
        toast.success("Company saved successfully");
        setCompany("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save company";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Title text="Create Company" />
        <InputBox
          label="Company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Enter company name"
        />

        <Button onClick={handleSave} text="Save" />
      </div>
    </div>
  );
}
