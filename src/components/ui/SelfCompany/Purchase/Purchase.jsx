"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";
import { Package, Leaf, MapPin } from "lucide-react";
import StockDetailsModal from "./StockDetailsModal/StockDetailsModal";

const parseDateString = (dateString) => {
  if (!dateString) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(dateString);
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return null;
};

const formatDate = (dateString) => {
  const parsed = parseDateString(dateString);
  if (!parsed) return "-";
  return parsed.toLocaleDateString("en-GB");
};

const Purchase = ({ company, fromDate, toDate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const fetchSaudaHistory = async () => {
    try {
      setLoading(true);
      const dateParams =
        fromDate && toDate ? `&fromDate=${fromDate}&toDate=${toDate}` : "";

      const [purchaseRes, sellRes] = await Promise.all([
        axiosInstance.get(
          `/save-sauda/self-sauda?company=${encodeURIComponent(
            company
          )}${dateParams}`
        ),
        axiosInstance.get(`/save-sauda/sell-agarwal?${dateParams}`),
      ]);

      const purchaseEntries = (purchaseRes.data?.entries || []).flatMap((doc) =>
        Object.entries(doc.saudaEntries).flatMap(([unit, list]) =>
          list.map((item) => ({
            date: doc.date,
            unit,
            type: "purchase",
            ...item,
          }))
        )
      );

      const sellEntries = (sellRes.data?.entries || []).map((entry) => ({
        ...entry,
        type: "sell",
      }));

      const filtered = [...purchaseEntries, ...sellEntries]
        .filter((e) => e.tons > 0)
        .sort((a, b) => {
          const saudaA = parseInt(a.saudaNo?.toString().match(/\d+/)?.[0] || 0);
          const saudaB = parseInt(b.saudaNo?.toString().match(/\d+/)?.[0] || 0);
          return saudaB - saudaA;
        });

      setEntries(filtered);
      calculateStock(filtered);
    } catch (err) {
      console.error("Error fetching sauda history:", err);
      toast.error("Failed to load stock book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) fetchSaudaHistory();
  }, [company, fromDate, toDate]);

  const calculateStock = (data) => {
    const grouped = {};

    data.forEach((entry) => {
      const key = `${entry.commodity}__${entry.unit}`;
      if (!grouped[key]) {
        grouped[key] = {
          commodity: entry.commodity,
          unit: entry.unit,
          opening: 0,
          purchase: 0,
          sale: 0,
          closing: 0,
          purchaseEntries: [],
          saleEntries: [],
        };
      }

      if (entry.type === "purchase") {
        grouped[key].purchase += entry.tons;
        grouped[key].purchaseEntries.push(entry);
      } else if (entry.type === "sell") {
        grouped[key].sale += entry.tons;
        grouped[key].saleEntries.push(entry);
      }
    });

    Object.values(grouped).forEach((g) => {
      g.closing = g.opening + g.purchase - g.sale;
    });

    setStockData(Object.values(grouped));
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" /> Stock Book
      </h3>

      {loading ? (
        <Loading />
      ) : stockData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No data found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Commodity
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                  Opening
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                  Purchase
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                  Sale
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                  Closing
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stockData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-sm text-gray-800 flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-green-500" />
                    {row.commodity}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {row.unit}
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {row.opening.toFixed(2)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-right text-blue-600 font-semibold cursor-pointer hover:underline"
                    onClick={() =>
                      setSelectedDetails({
                        type: "purchase",
                        commodity: row.commodity,
                        unit: row.unit,
                        entries: row.purchaseEntries.sort((a, b) => {
                          const saudaA = parseInt(
                            a.saudaNo?.toString().match(/\d+/)?.[0] || 0
                          );
                          const saudaB = parseInt(
                            b.saudaNo?.toString().match(/\d+/)?.[0] || 0
                          );
                          return saudaB - saudaA;
                        }),
                      })
                    }
                  >
                    {row.purchase.toFixed(2)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-right text-red-600 font-semibold cursor-pointer hover:underline"
                    onClick={() =>
                      setSelectedDetails({
                        type: "sale",
                        commodity: row.commodity,
                        unit: row.unit,
                        entries: row.saleEntries.sort((a, b) => {
                          const saudaA = parseInt(
                            a.saudaNo?.toString().match(/\d+/)?.[0] || 0
                          );
                          const saudaB = parseInt(
                            b.saudaNo?.toString().match(/\d+/)?.[0] || 0
                          );
                          return saudaB - saudaA;
                        }),
                      })
                    }
                  >
                    {row.sale.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-bold">
                    {row.closing.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup Component */}
      {selectedDetails && (
        <StockDetailsModal
          details={selectedDetails}
          onClose={() => setSelectedDetails(null)}
        />
      )}
    </div>
  );
};

export default Purchase;
