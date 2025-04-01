"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import axios from "axios";

export default function Welcome() {
  const { mobile } = useUser();
  const [name, setName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");

  // Capitalize the first letter of each word
  const formatName = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/register");
        const data = response.data;

        // Find the user by mobile number
        const user = data.find((user) => user.mobile.toString() === mobile);

        if (user) {
          setName(formatName(user.name));
        } else {
          setName("Guest");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setName("Guest");
      }
    };

    fetchUser();
  }, [mobile]);

  const handleChangePassword = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/auth/change-password", {
        mobile,
        password,
      });

      if (response.data.success) {
        alert("Password changed successfully!");
        setShowModal(false);
        setPassword("");
      } else {
        alert("Failed to change password. Please try again.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-xl p-8 max-w-xl w-full text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {name}</h1>
        {/* <button
          onClick={handleChangePassword}
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          Change Password
        </button> */}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full p-2 border rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
