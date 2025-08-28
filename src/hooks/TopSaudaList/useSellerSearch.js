"use client";

import { useState, useMemo } from "react";

const useSellerSearch = (sellers) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSellers = useMemo(() => {
    if (!searchTerm.trim()) return sellers;

    return sellers.filter((seller) => {
      const name = (seller.name || seller).toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [sellers, searchTerm]);

  const clearSearch = () => setSearchTerm("");

  return {
    searchTerm,
    setSearchTerm,
    filteredSellers,
    clearSearch,
    hasSearchResults: filteredSellers.length > 0,
    searchCount: filteredSellers.length,
    totalCount: sellers.length,
  };
};

export default useSellerSearch;
