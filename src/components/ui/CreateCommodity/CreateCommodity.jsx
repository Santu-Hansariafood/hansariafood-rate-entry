"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { useCreateCommodity } from "@/hooks/Commodity/useCreateCommodity";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"), {
  loading: () => <Loading />,
});
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
});

export default function CreateCommodity() {
  const {
    commodity,
    subCategory,
    hasSubCategory,
    loading,
    suggestions,
    handleChange,
    handleSubCategoryChange,
    handleToggleSubCategory,
    handleSave,
    setCommodity,
  } = useCreateCommodity();

  const memoizedInput = useMemo(() => (
    <div>
      <InputBox
        label="Commodity"
        type="text"
        value={commodity}
        onChange={handleChange}
        placeholder="Enter commodity name"
      />
      {suggestions.length > 0 && (
        <ul className="mt-2 bg-gray-100 rounded p-2 text-sm">
          {suggestions.map((s, index) => (
            <li
              key={index}
              className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => setCommodity(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  ), [commodity, suggestions]);

  const memoizedSubCategoryInput = useMemo(() => (
    hasSubCategory && (
      <InputBox
        label="Sub Category"
        type="text"
        value={subCategory}
        onChange={handleSubCategoryChange}
        placeholder="Enter sub category name"
      />
    )
  ), [hasSubCategory, subCategory]);

  const memoizedButton = useMemo(() => (
    <Button
      onClick={handleSave}
      text={loading ? "Saving..." : "Save"}
      disabled={loading}
    />
  ), [handleSave, loading]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
          <Title text="Create Commodity" />
          {memoizedInput}
          <div className="flex items-center space-x-2">
            <input
              id="hasSubCategory"
              type="checkbox"
              checked={hasSubCategory}
              onChange={handleToggleSubCategory}
              className="w-4 h-4"
            />
            <label htmlFor="hasSubCategory" className="text-sm">
              Has Sub Category?
            </label>
          </div>
          {memoizedSubCategoryInput}
          {memoizedButton}
        </div>
      </div>
    </Suspense>
  );
}
