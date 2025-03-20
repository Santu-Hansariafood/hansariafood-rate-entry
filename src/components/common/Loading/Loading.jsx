"use client";
import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute w-full h-full border-8 border-green-500 border-t-yellow-500 rounded-full animate-spin"></div>
        <span className="text-lg font-bold text-gray-700">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
