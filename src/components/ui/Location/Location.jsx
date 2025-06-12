"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { MapPin, Building2, ChevronDown } from "lucide-react";
import { useCreateLocationForm } from "@/hooks/Location/useCreateLocationForm";
import Loading from "@/components/common/Loading/Loading";

import "react-toastify/dist/ReactToastify.css";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"), {
  loading: () => <Loading/>,
});
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading/>,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading/>,
});

export default function CreateLocation() {
  const {
    state,
    location,
    loading,
    isDropdownOpen,
    filteredStates,
    handleStateChange,
    handleStateSelect,
    handleSave,
    setLocation,
    setDropdownOpen,
  } = useCreateLocationForm();

  const renderDropdown = () =>
    isDropdownOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        {filteredStates.map((item, index) => (
          <div
            key={index}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            onClick={() => handleStateSelect(item.state)}
          >
            {item.state}
          </div>
        ))}
      </motion.div>
    );

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-blue-600" />
            <Title text="Create Location" />
          </div>
          <div className="relative mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <div className="relative">
              <input
                type="text"
                value={state}
                onChange={handleStateChange}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Select state"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {renderDropdown()}
            </div>
          </div>
          <div className="mb-6">
            <InputBox
              label="Location"
              name="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location name"
              icon={<MapPin className="w-5 h-5 text-gray-400" />}
            />
          </div>
          <Button
            text="Save Location"
            onClick={handleSave}
            isLoading={loading}
            className="w-full"
          />
        </motion.div>
      </div>
    </Suspense>
  );
}
