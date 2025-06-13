"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Page = () => {
  const { commodity } = useParams();
  const [commodityData, setCommodityData] = useState(null);

  useEffect(() => {
    if (!commodity) return;

    const fetchCommodity = async () => {
      try {
        const res = await axiosInstance.get(`/commodity?page=1&limit=100`);
        const found = res.data.commodities.find(
          (c) => c.name.toLowerCase() === commodity.toLowerCase()
        );

        if (found) {
          setCommodityData(found);
          console.log("Fetched commodity:", found);
        } else {
          console.warn("Commodity not found in list.");
        }
      } catch (err) {
        console.error("Error fetching commodity:", err);
      }
    };

    fetchCommodity();
  }, [commodity]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-white mb-2 pt-6 px-7">
        Commodity: {commodity}
      </h1>
      {commodityData ? (
        <pre className="bg-black/30 p-4 rounded-lg text-sm text-white/80">
          {JSON.stringify(commodityData, null, 2)}
        </pre>
      ) : (
        <p className="text-white/60">Loading commodity data...</p>
      )}
    </div>
  );
};

export default Page;
