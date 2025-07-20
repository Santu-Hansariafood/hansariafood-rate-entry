import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export const useTopDescriptions = (days) => {
  const [topList, setTopList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setTopList([]);
    setPage(1);
    setHasMore(true);
  }, [days]);

  useEffect(() => {
    const fetchTopDescriptions = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/save-sauda/description-top?days=${days}&page=${page}`
        );
        const newData = res.data?.data || [];
        const totalPages = res.data?.pagination?.pages || 1;

        setTopList((prev) => [...prev, ...newData]);
        setHasMore(page < totalPages);
      } catch (err) {
        console.error("Failed to fetch top descriptions:", err);
      }
      setLoading(false);
    };

    fetchTopDescriptions();
  }, [days, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return { topList, loading, hasMore, loadMore };
};
