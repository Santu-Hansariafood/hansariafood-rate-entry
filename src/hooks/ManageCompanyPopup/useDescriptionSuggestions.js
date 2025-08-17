"use client";

import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const useDescriptionSuggestions = () => {
  const [descSuggestions, setDescSuggestions] = useState([]);
  const [descKey, setDescKey] = useState("");

  const fetchDescriptionSuggestions = useCallback(
    debounce(async (q, key, idx) => {
      try {
        if (!q || q.length < 2) {
          setDescSuggestions([]);
          return;
        }
        setDescKey(`${key}-${idx}`);
        const res = await axiosInstance.get(
          `save-sauda/sauda-descriptions?q=${q}`
        );
        setDescSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300),
    []
  );

  return {
    descSuggestions,
    setDescSuggestions,
    descKey,
    fetchDescriptionSuggestions,
  };
};
