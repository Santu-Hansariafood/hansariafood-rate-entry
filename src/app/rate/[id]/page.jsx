"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const AuthWrapper = dynamic(() => import("@/components/AuthWrapper/AuthWrapper"), {
  loading: () => <Loading />,
});

const RateManagement = dynamic(() => import("@/components/ui/Rate/Rate"), {
  loading: () => <Loading />,
});

const Page = () => {
  const { id } = useParams();
  const [commodityData, setCommodityData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCommodity = async () => {
      try {
        const res = await axiosInstance.get(`/commodity?page=1&limit=100`);
        const found = res.data.commodities.find(
          (c) => c.name.toLowerCase() === id.toLowerCase()
        );

        if (found) {
          setCommodityData(found);
          console.log("Fetched commodity from param:", found);
        } else {
          console.warn("Commodity not found for id:", id);
        }
      } catch (err) {
        console.error("Error fetching commodity by name:", err);
      }
    };

    fetchCommodity();
  }, [id]);

  return (
    <AuthWrapper>
      <section role="region" aria-label="Rate Management Section">
        {commodityData ? (
          <RateManagement commodity={commodityData} />
        ) : (
          <Loading />
        )}
      </section>
    </AuthWrapper>
  );
};

export default Page;
