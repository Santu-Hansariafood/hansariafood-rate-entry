"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  suspense: true,
});

const Legend = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-10 w-full max-w-4xl px-4">
        <Title text="Legend" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <span>Green: No Sauda entered yet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            <span>Yellow: Partial Sauda filled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            <span>Blue: Sauda + Sauda No filled</span>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Legend;
