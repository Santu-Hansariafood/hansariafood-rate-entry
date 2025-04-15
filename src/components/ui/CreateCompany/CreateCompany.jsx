"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/common/Loading/Loading";
import { motion } from "framer-motion";
import { Building2, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
const Dropdown = dynamic(
  () => import("@/components/common/Dropdown/Dropdown"),
  {
    loading: () => <Loading />,
  }
);

export default function CreateCompany() {
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllCategories = async () => {
      let allCategories = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axiosInstance.get(`/categories?page=${page}`);
          const data = Array.isArray(response.data)
            ? response.data
            : response.data.categories || [];

          if (data.length > 0) {
            allCategories = [...allCategories, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }

        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching paginated categories:", error);
        toast.error("Failed to fetch categories");
      }
    };

    fetchAllCategories();
  }, []);

  const handleSave = useCallback(async () => {
    if (!company.trim() || !category.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsLoading(true);
      const { status } = await axiosInstance.post("/companies", {
        name: company,
        category,
      });
      if (status === 201) {
        toast.success("Company saved successfully");
        setCompany("");
        setCategory("");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save company");
    } finally {
      setIsLoading(false);
    }
  }, [company, category]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <Title text="Create New Company" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <InputBox
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Dropdown
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.name,
                  }))}
                  value={category}
                  onChange={setCategory}
                  className="w-full max-h-60 overflow-y-auto"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="large"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Create Company
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Suspense>
  );
}
