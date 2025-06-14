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
    loading,
    suggestions,
    handleChange,
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
          {memoizedButton}
        </div>
      </div>
    </Suspense>
  );
}
