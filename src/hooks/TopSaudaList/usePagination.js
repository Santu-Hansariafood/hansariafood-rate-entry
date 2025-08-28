"use client";

import { useState, useCallback } from "react";

const usePagination = (itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const getPageInfo = useCallback(
    (totalItems) => {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;
      const startItem = (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(currentPage * itemsPerPage, totalItems);

      return {
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        startItem,
        endItem,
        totalItems,
        itemsPerPage,
      };
    },
    [currentPage, itemsPerPage]
  );

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    resetToFirstPage,
    getPageInfo,
  };
};

export default usePagination;
