"use client";

import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputBox from "@/components/common/InputBox/InputBox";
import Title from "@/components/common/Title/Title";
import Button from "@/components/common/Button/Button";

export default function CreateCategory() {
  const [category, setCategory] = useState("");

  const handleSave = async () => {
    if (!category.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const response = await axios.post("/api/categories", { name: category });

      if (response.status === 201) {
        toast.success("Category saved successfully");
        setCategory("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save category";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Title text="Create Category" />
        <InputBox
          label="Category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category"
        />

        <Button onClick={handleSave} text="Save" />
      </div>
    </div>
  );
}
