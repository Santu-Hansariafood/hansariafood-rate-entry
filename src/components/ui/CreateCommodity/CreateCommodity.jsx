"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { useCreateCommodity } from "@/hooks/Commodity/useCreateCommodity";

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
  const {
    commodity,
    loading,
    suggestions,
    handleChange,
    handleSave: originalHandleSave,
    setCommodity,
  } = useCreateCommodity();

  const handleSave = async () => {
    try {
      await originalHandleSave();
      toast.success("Commodity saved successfully");
      setCommodity("");
    } catch (err) {
      toast.error("Failed to save commodity");
    }
  };

  const memoizedInput = useMemo(
    () => (
      <div>
        <InputBox
          label="Commodity"
          type="text"
          value={commodity}
          onChange={handleChange}
          placeholder="Enter commodity name"
          className="dark:bg-gray-700 dark:text-white"
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 bg-gray-100 dark:bg-gray-700 rounded p-2 text-sm">
            {suggestions.map((s, index) => (
              <li
                key={index}
                className="py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                onClick={() => setCommodity(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    [commodity, suggestions]
  );

  const memoizedButton = useMemo(
    () => (
      <Button
        onClick={handleSave}
        text={loading ? "Saving..." : "Save"}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      />
    ),
    [handleSave, loading]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
          <Title text="Create Commodity" className="dark:text-white" />
          {memoizedInput}
          {memoizedButton}
        </div>
      </div>
    </Suspense>
  );
}
