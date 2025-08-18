"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useCompanyData(name) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/managecompany?q=${name}`);
        const first = data?.companies?.[0];

        if (!first) {
          toast.error("Company details not found");
        } else {
          if (mounted) {
            setCompany(first);

            if (first.type?.length === 1) {
              setRole(first.type[0]);
            } else {
              setRole(null);
            }
          }
        }
      } catch {
        toast.error("Failed to load company details");
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [name]);

  return { company, loading, role };
}
