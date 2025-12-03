"use client";

import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";

const normalize = (s) => s?.trim().toLowerCase() || "";
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));
export default function SaudaTable({
  company,
  rateMap,
  entries,
  totalTons,
  handleChange,
  handleUnitSave,
  addRow,
  removeRow,
  saveStatus,
  sellers,
}) {
  let sl = 0;

  return (
    <Suspense fallback={<Loading />}>
      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-700 text-sm md:text-base shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white text-left shadow-md">
              <th className="px-4 py-3 font-semibold">Sl.</th>
              <th className="px-4 py-3 font-semibold">Unit</th>
              <th className="px-4 py-3 font-semibold">Commodity</th>
              <th className="px-4 py-3 font-semibold">Target Quantity</th>
              <th className="px-4 py-3 font-semibold">Rate</th>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3 font-semibold">Sauda Details</th>
              <th className="px-4 py-3 font-semibold">Total Tons</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {company.location.flatMap((unit) =>
              company.commodities.map((commodity) => {
                const keyNorm = `${normalize(unit)}-${normalize(commodity)}`;
                const rateObj = rateMap[keyNorm] || {};
                const newRate = rateObj.newRate || 0;
                const quantityNum = Number.isFinite(rateObj.quantity)
                  ? rateObj.quantity
                  : null;
                const key = `${unit}-${commodity}`;
                const list = entries[key] || [];
                const enteredTons = totalTons(key);
                const remaining =
                  quantityNum != null ? quantityNum - enteredTons : "-";

                if (newRate === 0) return null;
                sl += 1;

                return (
                  <tr
                    key={key}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-3 py-2">{sl}</td>
                    <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                      {unit}
                    </td>
                    <td className="px-3 py-2 dark:text-gray-300">
                      {commodity}
                    </td>
                    <td className="px-3 py-2 dark:text-gray-300">
                      {quantityNum != null
                        ? `${quantityNum} - ${enteredTons} = ${remaining}`
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700 dark:text-blue-400">
                      ₹ {newRate}
                    </td>
                    <td colSpan={2} className="space-y-1 px-3 py-2">
                      {list.map((e, idx) => {
                        const isFilled =
                          e?.tons &&
                          e?.finalRate &&
                          e?.sellerName &&
                          e?.sellerCompany;
                        const entryId = `${key}-${idx}`;

                        return (
                          <div
                            key={idx}
                            className={`
                            flex flex-col sm:flex-row flex-wrap gap-3 p-4 rounded-xl shadow-md transition-all duration-200
                            border-2
                            ${
                              isFilled
                                ? "border-green-400 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20"
                                : "border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20"
                            }
                            hover:shadow-lg
                          `}
                          >
                            <span className="text-base font-semibold text-gray-600 dark:text-gray-300">
                              {String.fromCharCode(97 + idx)}.
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ₹
                              </span>
                              <input
                                type="number"
                                placeholder="Rate"
                                className="w-20 rounded border border-gray-300 dark:border-gray-700 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                                value={e.finalRate || ""}
                                onChange={(ev) =>
                                  handleChange(
                                    key,
                                    idx,
                                    "finalRate",
                                    ev.target.value
                                  )
                                }
                              />
                            </div>
                            <input
                              type="number"
                              placeholder="Tons"
                              className="w-20 rounded border border-gray-300 dark:border-gray-700 
                              bg-white dark:bg-gray-800 
                              text-gray-800 dark:text-gray-200 
                              px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                              value={e.tons || ""}
                              onChange={(ev) =>
                                handleChange(key, idx, "tons", ev.target.value)
                              }
                            />
                            <div className="flex flex-col sm:flex-row gap-3 flex-grow">
                              <Dropdown
                                label="Seller"
                                options={sellers.map((s) => ({
                                  label: s.sellerName,
                                  value: s.sellerName,
                                }))}
                                value={e.sellerName || ""}
                                onChange={(val) => {
                                  handleChange(key, idx, "sellerName", val);
                                  handleChange(key, idx, "sellerCompany", "");
                                }}
                                placeholder="Select Seller..."
                              />

                              <Dropdown
                                label="Company"
                                options={
                                  sellers
                                    .find((s) => s.sellerName === e.sellerName)
                                    ?.companies?.map((companyName) => ({
                                      label: companyName,
                                      value: companyName,
                                    })) || []
                                }
                                value={e.sellerCompany || ""}
                                onChange={(val) =>
                                  handleChange(key, idx, "sellerCompany", val)
                                }
                                placeholder="Select Company..."
                              />
                            </div>
                            {e.showOthers || e.others !== "" ? (
                              <input
                                type="text"
                                placeholder="Others"
                                className="w-full rounded border border-yellow-300 dark:border-yellow-600 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                                value={e.others || ""}
                                onChange={(ev) =>
                                  handleChange(
                                    key,
                                    idx,
                                    "others",
                                    ev.target.value
                                  )
                                }
                              />
                            ) : (
                              <button
                                type="button"
                                className="text-xs text-blue-600 dark:text-blue-400 underline"
                                onClick={() =>
                                  handleChange(key, idx, "showOthers", true)
                                }
                              >
                                + notes
                              </button>
                            )}
                            <input
                              type="text"
                              placeholder="Sauda No"
                              className="w-24 rounded border border-orange-400 dark:border-orange-600 
                            bg-gray-100 dark:bg-gray-700 
                            text-gray-500 dark:text-gray-400 
                              px-2 py-1 text-sm cursor-not-allowed"
                              value={e.saudaNo || ""}
                              disabled
                            />
                            <input
                              type="text"
                              placeholder="Delivery Date (221125)"
                              maxLength={8}
                              className="w-28 rounded border border-purple-400 dark:border-purple-600 
    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
    px-2 py-1 text-sm focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500"
                              value={e.deliveryDate || ""}
                              onChange={(ev) => {
                                let raw = ev.target.value.replace(/\D/g, "");

                                const isDeleting =
                                  ev.nativeEvent.inputType ===
                                  "deleteContentBackward";

                                if (!isDeleting && raw.length === 4) {
                                  const day = raw.slice(0, 2);
                                  const month = Number(raw.slice(2, 4));

                                  const now = new Date();
                                  const shortYear = now.getFullYear() % 100;
                                  const currentMonth = now.getMonth() + 1;

                                  let year = shortYear;

                                  if (month < currentMonth) {
                                    year = shortYear + 1;
                                  }

                                  raw = `${day}${raw.slice(2, 4)}${year
                                    .toString()
                                    .padStart(2, "0")}`;
                                }

                                let formatted = raw;
                                if (formatted.length >= 2)
                                  formatted =
                                    formatted.slice(0, 2) +
                                    "/" +
                                    formatted.slice(2);
                                if (formatted.length >= 5)
                                  formatted =
                                    formatted.slice(0, 5) +
                                    "/" +
                                    formatted.slice(5, 7);

                                handleChange(
                                  key,
                                  idx,
                                  "deliveryDate",
                                  formatted
                                );
                              }}
                            />

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUnitSave(key, idx)}
                                className="rounded bg-green-600 dark:bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRow(key, idx)}
                                className="rounded bg-red-600 dark:bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                            {saveStatus[entryId] === "saving" && (
                              <span className="text-blue-500 text-xs">
                                Saving...
                              </span>
                            )}
                            {saveStatus[entryId] === "success" && (
                              <span className="text-green-500 text-xs">
                                ✔ Saved
                              </span>
                            )}
                            {saveStatus[entryId] === "error" && (
                              <span className="text-red-500 text-xs">
                                ✘ Error
                              </span>
                            )}
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-4 mt-1">
                        <button
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={() => addRow(key, newRate)}
                        >
                          + Add Sauda
                        </button>
                        {quantityNum != null && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Balance: {remaining}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-bold text-green-700 dark:text-green-400">
                      {enteredTons} Tons
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Suspense>
  );
}
