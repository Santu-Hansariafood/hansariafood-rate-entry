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
  const { commodity, loading, handleChange, handleSave } = useCreateCommodity();

  const memoizedInput = useMemo(() => (
    <InputBox
      label="Commodity"
      type="text"
      value={commodity}
      onChange={handleChange}
      placeholder="Enter commodity name"
    />
  ), [commodity, handleChange]);

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
