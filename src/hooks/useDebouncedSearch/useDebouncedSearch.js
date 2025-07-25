import { useState, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useDebouncedSearch(query, url, delay = 300) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchTerm) => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(url, {
            params: { search: searchTerm },
          });
          setResults(response.data.companies || []);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, delay),
    [url, delay]
  );

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  return { results, loading };
}
