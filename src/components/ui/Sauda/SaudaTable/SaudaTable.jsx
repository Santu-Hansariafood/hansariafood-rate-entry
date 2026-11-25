"use client";

import React, { Suspense, useState, useMemo } from "react";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import stateCityData from "@/data/state-city.json";

const normalize = (s) => s?.trim().toLowerCase() || "";
const Dropdown = dynamic(
  () => import("@/components/common/Dropdown/Dropdown")
);
const Modal = dynamic(
  () => import("@/components/common/Modal/Modal"),
  { suspense: true }
);

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
  companyNameToId,
  sellerIdToName,
  companyIdToName,
  date,
  mobile,
}) {
  let sl = 0;
  const [removeDialog, setRemoveDialog] = useState({
    open: false,
    key: "",
    idx: null,
    reason: "",
    error: "",
  });

  // Dropdown values are Seller ids while the labels keep showing the names.
  const sellerOptions = useMemo(
    () =>
      sellers.map((s) => ({
        label: s.sellerName,
        value: s._id,
      })),
    [sellers]
  );

  const loadingFromOptions = useMemo(
    () =>
      stateCityData
        .map((item) => item.state)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    []
  );

  // Seller id -> that seller's companies (values are Company ids).
  const sellerCompaniesMap = useMemo(() => {
    const map = new Map();
    sellers.forEach((s) => {
      map.set(
        s._id,
        (s.companies || []).map((name) => ({
          label: name,
          value: companyNameToId?.get(name) ?? name,
        }))
      );
    });
    return map;
  }, [sellers, companyNameToId]);

  const openRemoveDialog = (key, idx) => {
    setRemoveDialog({
      open: true,
      key,
      idx,
      reason: "",
      error: "",
    });
  };

  const closeRemoveDialog = () => {
    setRemoveDialog((prev) => ({
      ...prev,
      open: false,
      reason: "",
      error: "",
    }));
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setRemoveDialog((prev) => ({
      ...prev,
      reason: value,
      error: "",
    }));
  };

  const handleConfirmRemove = async () => {
    const trimmed = removeDialog.reason.trim().replace(/\s+/g, " ");
    const words = trimmed ? trimmed.split(" ") : [];
    if (!trimmed) {
      setRemoveDialog((prev) => ({
        ...prev,
        error: "Reason is required",
      }));
      return;
    }
    if (words.length > 3) {
      setRemoveDialog((prev) => ({
        ...prev,
        error: "Reason must be up to 3 words",
      }));
      return;
    }
    if (removeDialog.key && removeDialog.idx != null) {
      try {
        const list = entries[removeDialog.key] || [];
        const saudaEntry = list[removeDialog.idx];

        if (saudaEntry) {
          const { data } = await axiosInstance.post(
            "/save-sauda/delete-entry",
            {
              company: company.name,
              date,
              saudaEntry: {
                saudaNo: saudaEntry.saudaNo,
                unit: saudaEntry.unit || removeDialog.key.split("-")[0] || "",
                commodity:
                  saudaEntry.commodity ||
                  removeDialog.key.split("-")[1] ||
                  "",
                tons: saudaEntry.tons,
                finalRate: saudaEntry.finalRate,
                sellerName:
                  sellerIdToName?.get(saudaEntry.sellerId) ||
                  saudaEntry.sellerId ||
                  "",
                sellerCompany:
                  companyIdToName?.get(saudaEntry.sellerCompanyId) ||
                  saudaEntry.sellerCompanyId ||
                  "",
                deliveryDate: saudaEntry.deliveryDate,
                others: saudaEntry.others,
              },
              reason: trimmed,
              mobile,
            }
          );

          if (data.notificationDelivery?.error) {
            toast.warn(
              "Sauda deleted, but the app notification could not be sent."
            );
          } else if (data.notificationDelivery?.skipped) {
            toast.warn(
              `${data.notificationDelivery.skipped} registered user(s) need an app user ID to receive this sauda update.`
            );
          }
        }

        removeRow(removeDialog.key, removeDialog.idx);
        toast.success("Sauda deleted and logged successfully");
      } catch (error) {
        console.error("Failed to log deleted sauda:", error);
        toast.error("Failed to log deleted sauda");
      }
    }
    setRemoveDialog({
      open: false,
      key: "",
      idx: null,
      reason: "",
      error: "",
    });
  };

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
                          e?.sellerId &&
                          e?.sellerCompanyId;
                        const entryId = `${key}-${idx}`;
                        const letter = String.fromCharCode(97 + idx);

                        const daysInMonth = (month, fullYear) => {
                          const m = Number(month);
                          if (!m || m < 1 || m > 12) return 31;
                          return new Date(fullYear, m, 0).getDate();
                        };

                        return (
                          <div
                            key={idx}
                            className={`
                            grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-end gap-3 p-4 rounded-xl shadow-md transition-all duration-200
                            border-2
                            ${
                              isFilled
                                ? "border-green-400 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20"
                                : "border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20"
                            }
                            hover:shadow-lg
                          `}
                          >
                            {/* Row 1: Rate · Tons · Loading From */}
                            <div className="min-w-0 md:col-span-1 lg:col-span-2">
                              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                                <span className="mr-1 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-white/15 dark:text-gray-300">
                                  {letter}.
                                </span>
                                Rate
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  placeholder="Rate"
                                  className="h-9 w-full min-w-0 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
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
                            </div>
                            <div className="min-w-0 md:col-span-1 lg:col-span-2">
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                Tons
                              </label>
                              <input
                                type="number"
                                placeholder="Tons"
                                className="h-9 w-full min-w-0 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                                value={e.tons || ""}
                                onChange={(ev) =>
                                  handleChange(key, idx, "tons", ev.target.value)
                                }
                              />
                            </div>
                            <div className="col-span-2 md:col-span-2 lg:col-span-2 min-w-0 [&>div]:gap-1 [&_input]:h-9 [&_input]:px-3 [&_input]:py-1.5 [&_input]:pr-9">
                              <Dropdown
                                label="Loading From"
                                options={loadingFromOptions}
                                value={e.loadingFrom || ""}
                                onChange={(value) =>
                                  handleChange(key, idx, "loadingFrom", value)
                                }
                                placeholder="Select State..."
                                clearOnEmpty
                              />
                            </div>

                            {/* Row 2: Seller · Company */}
                            <div className="col-span-2 md:col-span-2 lg:col-span-3 min-w-0 [&>div]:gap-1 [&_input]:h-9 [&_input]:px-3 [&_input]:py-1.5 [&_input]:pr-9">
                              <Dropdown
                                label="Seller"
                                options={sellerOptions}
                                value={e.sellerId || ""}
                                onChange={(val) => {
                                  handleChange(key, idx, "sellerId", val);
                                  handleChange(key, idx, "sellerCompanyId", "");
                                }}
                                placeholder="Select Seller..."
                              />
                            </div>
                            <div className="col-span-2 md:col-span-2 lg:col-span-3 min-w-0 [&>div]:gap-1 [&_input]:h-9 [&_input]:px-3 [&_input]:py-1.5 [&_input]:pr-9">
                              <Dropdown
                                label="Company"
                                options={sellerCompaniesMap.get(e.sellerId) || []}
                                value={e.sellerCompanyId || ""}
                                onChange={(val) =>
                                  handleChange(key, idx, "sellerCompanyId", val)
                                }
                                placeholder="Select Company..."
                              />
                            </div>

                            {/* Row 3: Sauda No · Delivery Date · Save/Remove */}
                            <div className="min-w-0 md:col-span-1 lg:col-span-2">
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                Sauda No
                              </label>
                              <input
                                type="text"
                                placeholder="Sauda No"
                                className="h-9 w-full min-w-0 rounded border border-orange-400 dark:border-orange-600
                                bg-gray-100 dark:bg-gray-700
                                text-gray-500 dark:text-gray-400
                                px-2 text-sm cursor-not-allowed"
                                value={e.saudaNo ? e.saudaNo.toString().split("-").pop() : ""}
                                disabled
                              />
                            </div>
                            <div className="min-w-0 md:col-span-1 lg:col-span-2">
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                Delivery Date
                              </label>
                              <input
                                type="text"
                                placeholder="DD/MM/YY"
                                maxLength={8}
                                className="h-9 w-full min-w-0 rounded border border-purple-400 dark:border-purple-600
                                bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                px-2 text-sm focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500"
                                value={e.deliveryDate || ""}
                                onChange={(ev) => {
                                  let raw = ev.target.value.replace(/\D/g, "");

                                  const isDeleting =
                                    ev.nativeEvent.inputType ===
                                    "deleteContentBackward";

                                  if (!isDeleting && raw.length === 4) {
                                    let day = Number(raw.slice(0, 2));
                                    let month = Number(raw.slice(2, 4));

                                    // Clamp month to 1–12
                                    if (month > 12) month = 12;
                                    if (month < 1) month = 1;

                                    const now = new Date();
                                    const shortYear = now.getFullYear() % 100;
                                    const currentMonth = now.getMonth() + 1;

                                    let year = shortYear;

                                    if (month < currentMonth) {
                                      year = shortYear + 1;
                                    }

                                    const fullYear = 2000 + year;
                                    const maxDay = daysInMonth(month, fullYear);
                                    if (day > maxDay) day = maxDay;
                                    if (day < 1) day = 1;

                                    raw = `${String(day).padStart(2, "0")}${String(
                                      month
                                    ).padStart(2, "0")}${year
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
                            </div>
                            <div className="col-span-2 md:col-span-2 lg:col-span-2 flex flex-wrap items-end justify-end gap-2 min-w-0">
                              <button
                                type="button"
                                disabled={saveStatus[entryId] === "saving"}
                                onClick={() => handleUnitSave(key, idx)}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors
                                  ${
                                    saveStatus[entryId] === "saving"
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                  }`}
                              >
                                {saveStatus[entryId] === "saving"
                                  ? "Saving..."
                                  : "Save"}
                              </button>
                              <button
                                type="button"
                                disabled={saveStatus[entryId] === "saving"}
                                onClick={() => openRemoveDialog(key, idx)}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors
                                  ${
                                    saveStatus[entryId] === "saving"
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                  }`}
                              >
                                Remove
                              </button>
                            </div>

                            {/* Row 4: Notes / Others (full width) */}
                            {e.showOthers || e.others !== "" ? (
                              <input
                                type="text"
                                placeholder="Others"
                                className="col-span-2 md:col-span-4 lg:col-span-6 h-9 w-full min-w-0 rounded border border-yellow-300 dark:border-yellow-600
                                bg-white dark:bg-gray-800
                                text-gray-800 dark:text-gray-200
                                px-3 text-sm focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
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
                                className="col-span-2 md:col-span-4 lg:col-span-6 justify-self-start text-xs text-blue-600 dark:text-blue-400 underline"
                                onClick={() =>
                                  handleChange(key, idx, "showOthers", true)
                                }
                              >
                                + notes
                              </button>
                            )}

                            {(saveStatus[entryId] === "saving" ||
                              saveStatus[entryId] === "success" ||
                              saveStatus[entryId] === "error") && (
                              <div className="col-span-2 md:col-span-4 lg:col-span-6 flex items-center gap-2 text-xs">
                                {saveStatus[entryId] === "saving" && (
                                  <span className="text-blue-500">Saving...</span>
                                )}
                                {saveStatus[entryId] === "success" && (
                                  <span className="text-green-500">✔ Saved</span>
                                )}
                                {saveStatus[entryId] === "error" && (
                                  <span className="text-red-500">✘ Error</span>
                                )}
                              </div>
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
      {removeDialog.open && (
        <Modal onClose={closeRemoveDialog}>
          <div className="p-6 dark:bg-gray-900 dark:text-gray-200">
            <h2 className="text-lg font-semibold mb-4">Are you sure to remove?</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Please enter a reason (maximum 3 words) before removing.
            </p>
            <input
              type="text"
              value={removeDialog.reason}
              onChange={handleReasonChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-2 rounded bg-white dark:bg-gray-800 dark:text-gray-200"
              placeholder="Reason"
            />
            {removeDialog.error && (
              <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                {removeDialog.error}
              </p>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded"
                onClick={closeRemoveDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                onClick={handleConfirmRemove}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Suspense>
  );
}
