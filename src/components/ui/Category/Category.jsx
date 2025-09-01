"use client";

import { useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { useCategory } from "@/hooks/Category/useCategory";

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

export default function CreateCategory() {
  const { category, loading, handleChange, handleSave } = useCategory();

  const memoizedInput = useMemo(
    () => (
      <InputBox
        label="Category"
        type="text"
        value={category}
        onChange={handleChange}
        placeholder="Enter category"
      />
    ),
    [category, handleChange]
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
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-300">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-6 transition-colors duration-300">
          <Title
            text="Create Category"
            className="text-gray-800 dark:text-gray-100"
          />
          <div className="dark:text-gray-200">{memoizedInput}</div>
          {memoizedButton}
        </div>
      </div>
    </Suspense>
  );
}
