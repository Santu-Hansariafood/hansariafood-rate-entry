"use client";
import Loading from "@/components/common/Loading/Loading";
import React, { Suspense } from "react";

export default function PopupWrapper({ children }) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
        <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 relative">
          {children}
        </div>
      </div>
    </Suspense>
  );
}
