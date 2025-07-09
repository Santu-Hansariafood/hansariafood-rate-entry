import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export const useSaudaTonsData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/save-sauda/sauda-total-by-date");
        const parsed = res.data.map(({ date, totalTons }) => {
          const [d, m, y] = date.split("-").map(Number);
          const dt = new Date(y, m - 1, d);
          return { date: dt, label: dt.toLocaleDateString("en-GB"), totalTons };
        });
        setData(parsed.filter((d) => !isNaN(d.date)));
      } catch (err) {
        toast.error("Failed to load sauda tons data.");
      }
    };

    fetchData();
  }, []);

  return data;
};
