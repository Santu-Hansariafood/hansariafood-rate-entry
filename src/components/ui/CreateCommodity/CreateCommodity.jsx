"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";

const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    loading: () => <Loading />,
  }
);
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
});

export default function CreateCommodity() {
  const [commodity, setCommodity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setCommodity(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    if (!commodity.trim()) {
      toast.error("Commodity name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/commodity", { name: commodity });
      if (response.status === 201) {
        toast.success("Commodity saved successfully");
        setCommodity("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save commodity";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [commodity]);

  const memoizedInput = useMemo(
    () => (
      <InputBox
        label="Commodity"
        type="text"
        value={commodity}
        onChange={handleChange}
        placeholder="Enter commodity name"
      />
    ),
    [commodity, handleChange]
  );

  const memoizedButton = useMemo(
    () => (
      <Button
        onClick={handleSave}
        text={loading ? "Saving..." : "Save"}
        disabled={loading}
      />
    ),
    [handleSave, loading]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <Title text="Create Commodity" />
        {memoizedInput}
        {memoizedButton}
      </div>
    </div>
  );
}
