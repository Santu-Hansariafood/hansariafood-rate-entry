"use client";

import React, { Suspense } from "react";
import { Save, Share2, ArrowDownToLine } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";

export default function ActionButtons({ onSave, onShare, onExportRate }) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save
        </button>

        <button
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
          Share Sauda
        </button>

        <button
          className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          onClick={onExportRate}
        >
          <ArrowDownToLine className="h-4 w-4" />
          Export Rate
        </button>
      </div>
    </Suspense>
  );
}
