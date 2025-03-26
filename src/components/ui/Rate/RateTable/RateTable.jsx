import { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading/Loading";

export default function RateTable({ selectedCompany, onClose }) {
  const [rates, setRates] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const fetchRates = useCallback(async () => {
    try {
      const [{ data: companyData }, { data: existingRates }] =
        await Promise.all([
          axios.get("/api/managecompany"),
          axios.get(`/api/rate?company=${selectedCompany}`),
        ]);

      const company = companyData.companies.find(
        (c) => c.name === selectedCompany
      );

      if (company) {
        setRates(
          company.location.map((location) => {
            const foundRate = existingRates.find(
              (rate) => rate.location === location
            );
            return {
              location,
              oldRate: foundRate?.oldRates?.at(-1) || "—",
              newRate: foundRate?.newRate ?? "",
              isUpdated: false,
            };
          })
        );
      }
    } catch (error) {
      toast.error("Failed to fetch locations or rates");
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleEdit = (index) => setEditIndex(index);

  const handleSave = async (index) => {
    const rateToSave = rates[index];

    if (!rateToSave.newRate.trim()) {
      toast.error("New rate cannot be empty!");
      return;
    }

    try {
      const newOldRate = `${
        rateToSave.newRate
      } (${new Date().toLocaleDateString("en-GB")})`;

      await axios.post("/api/rate", {
        company: selectedCompany,
        location: rateToSave.location,
        newRate: rateToSave.newRate,
        oldRates: [newOldRate],
      });

      toast.success("Rate updated successfully!");
      setEditIndex(null);
      setRates((prevRates) =>
        prevRates.map((rate, idx) =>
          idx === index
            ? {
                ...rate,
                oldRate: newOldRate,
                newRate: rateToSave.newRate,
                isUpdated: true,
              }
            : rate
        )
      );
    } catch (error) {
      toast.error("Error updating rate.");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Rates for {selectedCompany}
          </h3>
          <div className="max-h-96 overflow-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 sticky top-0 shadow-md">
                <tr>
                  <th className="border p-2">Location</th>
                  <th className="border p-2">Last Rate</th>
                  <th className="border p-2">New Rate</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate, index) => (
                  <tr
                    key={index}
                    className={`text-center ${
                      rate.isUpdated ? "bg-green-100 transition-all" : ""
                    }`}
                  >
                    <td className="border p-2">{rate.location}</td>
                    <td className="border p-2 text-sm">{rate.oldRate}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={rate.newRate}
                        onChange={(e) =>
                          setRates((prev) =>
                            prev.map((r, idx) =>
                              idx === index
                                ? { ...r, newRate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="border p-1 w-full"
                        disabled={editIndex !== index}
                      />
                    </td>
                    <td className="border p-2">
                      {editIndex === index ? (
                        <button
                          onClick={() => handleSave(index)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(index)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
