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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <LegendItem
            color="bg-green-400 dark:bg-green-500"
            text="Green: No Sauda entered yet"
          />
          <LegendItem
            color="bg-yellow-400 dark:bg-yellow-500"
            text="Yellow: Partial Sauda filled"
          />
          <LegendItem
            color="bg-blue-400 dark:bg-blue-500"
            text="Blue: Sauda + Sauda No filled"
          />
        </div>
      </div>
    </Suspense>
  );
};

const LegendItem = ({ color, text }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 shadow-sm transition-colors">
    <div className={`w-4 h-4 rounded-full ${color}`}></div>
    <span className="text-gray-800 dark:text-gray-200">{text}</span>
  </div>
);

export default Legend;
