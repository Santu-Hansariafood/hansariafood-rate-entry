"use client";
import Loading from "@/components/common/Loading/Loading";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
const Title = dynamic(()=>import("@/components/common/Title/Title"));

export default function PopupHeader({ onClose, userName }) {
  return (
    <Suspense fallback={<Loading/>}>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
      >
        <X />
      </button>
      <Title text={`Weekly Rate Sheet for ${userName || "User"}`} />
    </Suspense>
  );
}
