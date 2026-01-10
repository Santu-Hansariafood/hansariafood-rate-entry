"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { MapPin, Building2, ChevronDown } from "lucide-react";
import { useCreateLocationForm } from "@/hooks/Location/useCreateLocationForm";
import Loading from "@/components/common/Loading/Loading";
import "react-toastify/dist/ReactToastify.css";

const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  { loading: () => <Loading /> }
);

const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});

const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          absolute z-20 w-full mt-2
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          rounded-xl shadow-xl
          max-h-60 overflow-y-auto
        "
      >
        {filteredStates.length > 0 ? (
          filteredStates.map((item, index) => (
            <div
              key={index}
              className="
                px-4 py-2 cursor-pointer
                hover:bg-green-50 dark:hover:bg-green-900/30
                text-gray-800 dark:text-gray-200
                transition-colors
              "
              onClick={() => handleStateSelect(item.state)}
            >
              {item.state}
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            No results found
          </div>
        )}
      </motion.div>
    );

  return (
    <Suspense fallback={<Loading />}>
      <div
        className="
          flex flex-col items-center justify-center
          px-4 sm:px-8 py-10
          bg-gradient-to-br from-gray-50 to-gray-100
          dark:from-gray-900 dark:to-gray-950
          min-h-screen transition-colors duration-300
        "
      >
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="
            bg-white dark:bg-gray-800
            p-8 sm:p-10
            rounded-2xl shadow-2xl
            w-full max-w-2xl
            transition-colors duration-300
          "
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
              <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Title text="Create Location" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={state}
                  onChange={handleStateChange}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Select or type state name"
                  className="
                    w-full px-4 py-3
                    border border-gray-300 dark:border-gray-700
                    rounded-xl
                    bg-white dark:bg-gray-900
                    text-gray-800 dark:text-gray-200
                    focus:ring-2 focus:ring-green-500
                    focus:border-green-500 outline-none
                    transition-all
                  "
                />

                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                {renderDropdown()}
              </div>
            </div>
            <div>
              <InputBox
                label="Location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => {
                  const value = e.target.value;
                  const blocked = /[\[\]\{\}\(\)\.,&\?%#@_+\-=\/]/g;
                  if (!blocked.test(value)) {
                    setLocation(value);
                  }
                }}
                placeholder="Enter location name"
                icon={
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                }
              />
            </div>
            <div className="pt-4">
              <Button
                text="Save Location"
                onClick={handleSave}
                isLoading={loading}
                className="w-full py-3 text-lg rounded-xl"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </Suspense>
  );
}
