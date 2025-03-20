"use client";

import { Suspense, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Button = dynamic(() => import("@/components/common/Button/Button"));

export default function CreateLocation() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!location.trim()) {
      toast.error("Location name cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/location", { name: location });

      if (response.status === 201) {
        toast.success("Location saved successfully");
        setLocation("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to save location";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <Title text="Create Location" />
          <InputBox
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />

          <Button text="Save" onClick={handleSave} isLoading={loading} />
        </div>
      </div>
    </Suspense>
  );
}
