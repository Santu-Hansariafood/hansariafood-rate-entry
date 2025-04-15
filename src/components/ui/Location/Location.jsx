"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { MapPin, Building2, ChevronDown } from "lucide-react";
import stateCityData from "@/data/state-city.json";

const InputBox = dynamic(
  () => import("@/components/common/InputBox/InputBox"),
  {
    loading: () => <Loading />,
  }
);
const Title = dynamic(() => import("@/components/common/Title/Title"), {
  loading: () => <Loading />,
});
const Button = dynamic(() => import("@/components/common/Button/Button"), {
  loading: () => <Loading />,
});

export default function CreateLocation() {
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const filteredStates = useMemo(() => {
    if (!state.trim()) return stateCityData;
    return stateCityData.filter((item) =>
      item.state.toLowerCase().includes(state.toLowerCase())
    );
  }, [state]);

  const handleStateChange = (e) => {
    setState(e.target.value);
    setDropdownOpen(true);
  };

  const handleStateSelect = (selectedState) => {
    setState(selectedState);
    setDropdownOpen(false);
  };

  const handleSave = useCallback(async () => {
    if (!state.trim()) return toast.error("Please select a state");
    if (!location.trim()) return toast.error("Location name cannot be empty");

    try {
      setLoading(true);
      const { status } = await axiosInstance.post("/location", {
        state,
        name: location,
      });

      if (status === 201) {
        toast.success("Location saved successfully");
        setState("");
        setLocation("");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save location");
    } finally {
      setLoading(false);
    }
  }, [state, location]);

  const renderDropdown = () =>
    isDropdownOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        {filteredStates.map((item, index) => (
          <div
            key={index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
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
