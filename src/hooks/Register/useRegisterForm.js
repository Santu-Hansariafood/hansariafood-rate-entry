"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { validationPatterns } from "@/utils/validationPatterns/validationPatterns";

export default function useRegisterForm() {
  const [form, setForm] = useState({ name: "", mobile: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.name) {
      newErrors.name = "Name is required";
    } else if (!validationPatterns.name.test(form.name)) {
      newErrors.name = "Name should be 2-50 letters only";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!validationPatterns.mobile.test(form.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!validationPatterns.password.test(form.password)) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value && !validationPatterns.name.test(value)) {
      setErrors((prev) => ({ ...prev, name: "Name should be 2-50 letters only" }));
    } else if (name === "mobile" && value && !validationPatterns.mobile.test(value)) {
      setErrors((prev) => ({ ...prev, mobile: "Enter a valid 10-digit mobile number" }));
    } else if (name === "password" && value && !validationPatterns.password.test(value)) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters long" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", form);
      toast.success(res.data.message);
      setForm({ name: "", mobile: "", password: "" });
      setErrors({});
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Something went wrong!");
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, loading, handleChange, handleSubmit };
}
