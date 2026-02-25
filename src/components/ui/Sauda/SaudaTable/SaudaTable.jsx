"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const normalize = (s) => s?.trim().toLowerCase() || "";
const Dropdown = dynamic(
  () => import("@/components/common/Dropdown/Dropdown")
);
const Modal = dynamic(
  () => import("@/components/common/Modal/Modal"),
  { suspense: true }
);

function useSellerLookups(sellers) {
  return useMemo(() => {
    const sellerOptions = Array.isArray(sellers)
      ? sellers
          .map((s) => s?.sellerName)
          .filter(Boolean)
          .map((name) => ({
            label: String(name),
            value: String(name),
          }))
      : [];

    const companiesBySeller = new Map();
    if (Array.isArray(sellers)) {
      for (const s of sellers) {
        const sellerName = s?.sellerName;
        if (!sellerName) continue;
        const companies = Array.isArray(s?.companies)
          ? s.companies.filter(Boolean).map(String)
          : [];
        companiesBySeller.set(String(sellerName), companies);
      }
    }

    return { sellerOptions, companiesBySeller };
  }, [sellers]);
}

function useSaudaRows(company, rateMap) {
  return useMemo(() => {
    const units = Array.isArray(company?.location) ? company.location : [];
    const commodities = Array.isArray(company?.commodities)
      ? company.commodities
      : [];

    const rows = [];
    for (const unit of units) {
      for (const commodity of commodities) {
        const keyNorm = `${normalize(unit)}-${normalize(commodity)}`;
        const rateObj = rateMap?.[keyNorm] || {};
        const newRate = rateObj.newRate || 0;
        if (newRate === 0) continue;

        const quantityNum = Number.isFinite(rateObj.quantity)
          ? rateObj.quantity
          : null;
        const key = `${unit}-${commodity}`;
        rows.push({
          unit,
          commodity,
          key,
          newRate,
          quantityNum,
        });
      }
    }
    return rows;
  }, [company?.location, company?.commodities, rateMap]);
}

function useTopSellerNames(entries, sellers) {
  return useMemo(() => {
    const counts = new Map();
    const lists =
      entries && typeof entries === "object" ? Object.values(entries) : [];

    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        const n = item?.sellerName;
        if (!n) continue;
        const key = String(n);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }

    const byUsage = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);

    const fallback = Array.isArray(sellers)
      ? sellers
          .map((s) => s?.sellerName)
          .filter(Boolean)
          .map(String)
      : [];

    const merged = [];
    for (const name of [...byUsage, ...fallback]) {
      if (merged.includes(name)) continue;
      merged.push(name);
      if (merged.length >= 3) break;
    }
    return merged;
  }, [entries, sellers]);
}

function useRemoveSaudaDialog({ entries, company, date, mobile, removeRow }) {
  const [removeDialog, setRemoveDialog] = useState({
    open: false,
    key: "",
    idx: null,
    sellerName: "",
    sellerCompany: "",
    saudaNo: "",
    reason: "",
    error: "",
  });

  const openRemoveDialog = useCallback(
    (key, idx) => {
      const entry = (entries?.[key] || [])?.[idx] || {};
      setRemoveDialog({
        open: true,
        key,
        idx,
        sellerName: entry?.sellerName || "",
        sellerCompany: entry?.sellerCompany || "",
        saudaNo: entry?.saudaNo ? entry.saudaNo.toString().slice(-4) : "",
        reason: "",
        error: "",
      });
    },
    [entries]
  );

  const closeRemoveDialog = useCallback(() => {
    setRemoveDialog((prev) => ({
      ...prev,
      open: false,
      sellerName: "",
      sellerCompany: "",
      saudaNo: "",
      reason: "",
      error: "",
    }));
  }, []);

  const handleReasonChange = useCallback((e) => {
    const value = e.target.value;
    setRemoveDialog((prev) => ({
      ...prev,
      reason: value,
      error: "",
    }));
  }, []);

  const handleConfirmRemove = useCallback(async () => {
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
        const list = entries?.[removeDialog.key] || [];
        const saudaEntry = list[removeDialog.idx];

        if (saudaEntry) {
          await axiosInstance.post("/save-sauda/delete-entry", {
            company: company.name,
            date,
            saudaEntry: {
              saudaNo: saudaEntry.saudaNo,
              unit: saudaEntry.unit || removeDialog.key.split("-")[0] || "",
              commodity:
                saudaEntry.commodity || removeDialog.key.split("-")[1] || "",
              tons: saudaEntry.tons,
              finalRate: saudaEntry.finalRate,
              sellerName: saudaEntry.sellerName,
              sellerCompany: saudaEntry.sellerCompany,
              deliveryDate: saudaEntry.deliveryDate,
              others: saudaEntry.others,
            },
            reason: trimmed,
            mobile,
          });
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
      sellerName: "",
      sellerCompany: "",
      saudaNo: "",
      reason: "",
      error: "",
    });
  }, [removeDialog, entries, company.name, date, mobile, removeRow]);

  return {
    removeDialog,
    openRemoveDialog,
    closeRemoveDialog,
    handleReasonChange,
    handleConfirmRemove,
  };
}

const SaudaEntryCard = React.memo(function SaudaEntryCard({
  rowKey,
  idx,
  entry,
  sellerOptions,
  companiesBySeller,
  topSellerNames,
  saveStatus,
  handleChange,
  handleUnitSave,
  openRemoveDialog,
}) {
  const isFilled = useMemo(() => {
    return (
      entry?.tons &&
      entry?.finalRate &&
      entry?.sellerName &&
      entry?.sellerCompany
    );
  }, [entry?.finalRate, entry?.sellerCompany, entry?.sellerName, entry?.tons]);

  const entryId = useMemo(() => `${rowKey}-${idx}`, [rowKey, idx]);

  const onRateChange = useCallback(
    (ev) => handleChange(rowKey, idx, "finalRate", ev.target.value),
    [handleChange, rowKey, idx]
  );

  const onTonsChange = useCallback(
    (ev) => handleChange(rowKey, idx, "tons", ev.target.value),
    [handleChange, rowKey, idx]
  );

  const onSellerSelect = useCallback(
    (val) => {
      handleChange(rowKey, idx, "sellerName", val);
      handleChange(rowKey, idx, "sellerCompany", "");
    },
    [handleChange, rowKey, idx]
  );

  const onCompanySelect = useCallback(
    (val) => handleChange(rowKey, idx, "sellerCompany", val),
    [handleChange, rowKey, idx]
  );

  const onQuickSeller = useCallback(
    (name) => {
      handleChange(rowKey, idx, "sellerName", name);
      handleChange(rowKey, idx, "sellerCompany", "");
    },
    [handleChange, rowKey, idx]
  );

  const onToggleNotes = useCallback(() => {
    handleChange(rowKey, idx, "showOthers", true);
  }, [handleChange, rowKey, idx]);

  const onOthersChange = useCallback(
    (ev) => handleChange(rowKey, idx, "others", ev.target.value),
    [handleChange, rowKey, idx]
  );

  const onDeliveryDateChange = useCallback(
    (ev) => {
      let raw = ev.target.value.replace(/\D/g, "");

      const isDeleting =
        ev.nativeEvent?.inputType === "deleteContentBackward";

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

        raw = `${day}${raw.slice(2, 4)}${year.toString().padStart(2, "0")}`;
      }

      let formatted = raw;
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
      }
      if (formatted.length >= 5) {
        formatted = formatted.slice(0, 5) + "/" + formatted.slice(5, 7);
      }

      handleChange(rowKey, idx, "deliveryDate", formatted);
    },
    [handleChange, rowKey, idx]
  );

  const companyOptions = useMemo(() => {
    const companies = companiesBySeller.get(entry?.sellerName) || [];
    return companies.map((companyName) => ({
      label: companyName,
      value: companyName,
    }));
  }, [companiesBySeller, entry?.sellerName]);

  return (
    <div
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
        <span className="text-sm text-gray-500 dark:text-gray-400">₹</span>
        <input
          type="number"
          placeholder="Rate"
          className="w-20 rounded border border-gray-300 dark:border-gray-700 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
          value={entry?.finalRate || ""}
          onChange={onRateChange}
        />
      </div>
      <input
        type="number"
        placeholder="Tons"
        className="w-20 rounded border border-gray-300 dark:border-gray-700 
                              bg-white dark:bg-gray-800 
                              text-gray-800 dark:text-gray-200 
                              px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
        value={entry?.tons || ""}
        onChange={onTonsChange}
      />
      <div className="flex flex-col sm:flex-row gap-3 flex-grow">
        {topSellerNames.length > 0 && (
          <div className="w-full">
            <div className="flex items-center gap-2 overflow-x-auto">
              {topSellerNames.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onQuickSeller(n)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 px-3 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
        <Dropdown
          label="Seller"
          options={sellerOptions}
          value={entry?.sellerName || ""}
          onChange={onSellerSelect}
          placeholder="Select Seller..."
        />

        <Dropdown
          label="Company"
          options={companyOptions}
          value={entry?.sellerCompany || ""}
          onChange={onCompanySelect}
          placeholder="Select Company..."
        />
      </div>
      {entry?.showOthers || entry?.others !== "" ? (
        <input
          type="text"
          placeholder="Others"
          className="w-full rounded border border-yellow-300 dark:border-yellow-600 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
          value={entry?.others || ""}
          onChange={onOthersChange}
        />
      ) : (
        <button
          type="button"
          className="text-xs text-blue-600 dark:text-blue-400 underline"
          onClick={onToggleNotes}
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
        value={entry?.saudaNo ? entry.saudaNo.toString().slice(-4) : ""}
        disabled
      />
      <input
        type="text"
        placeholder="Delivery Date (221125)"
        maxLength={8}
        className="w-28 rounded border border-purple-400 dark:border-purple-600 
    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
    px-2 py-1 text-sm focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500"
        value={entry?.deliveryDate || ""}
        onChange={onDeliveryDateChange}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleUnitSave(rowKey, idx)}
          className="rounded bg-green-600 dark:bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => openRemoveDialog(rowKey, idx)}
          className="rounded bg-red-600 dark:bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          Remove
        </button>
      </div>
      {saveStatus?.[entryId] === "saving" && (
        <span className="text-blue-500 text-xs">Saving...</span>
      )}
      {saveStatus?.[entryId] === "success" && (
        <span className="text-green-500 text-xs">✔ Saved</span>
      )}
      {saveStatus?.[entryId] === "error" && (
        <span className="text-red-500 text-xs">✘ Error</span>
      )}
    </div>
  );
});

const SaudaRow = React.memo(function SaudaRow({
  sl,
  unit,
  commodity,
  rowKey,
  quantityNum,
  newRate,
  list,
  enteredTons,
  remaining,
  sellerOptions,
  companiesBySeller,
  topSellerNames,
  saveStatus,
  handleChange,
  handleUnitSave,
  addRow,
  openRemoveDialog,
}) {
  return (
    <tr
      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <td className="px-3 py-2">{sl}</td>
      <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
        {unit}
      </td>
      <td className="px-3 py-2 dark:text-gray-300">{commodity}</td>
      <td className="px-3 py-2 dark:text-gray-300">
        {quantityNum != null ? `${quantityNum} - ${enteredTons} = ${remaining}` : "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700 dark:text-blue-400">
        ₹ {newRate}
      </td>
      <td colSpan={2} className="space-y-1 px-3 py-2">
        {list.map((entry, idx) => (
          <SaudaEntryCard
            key={idx}
            rowKey={rowKey}
            idx={idx}
            entry={entry}
            sellerOptions={sellerOptions}
            companiesBySeller={companiesBySeller}
            topSellerNames={topSellerNames}
            saveStatus={saveStatus}
            handleChange={handleChange}
            handleUnitSave={handleUnitSave}
            openRemoveDialog={openRemoveDialog}
          />
        ))}
        <div className="flex items-center gap-4 mt-1">
          <button
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => addRow(rowKey, newRate)}
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
});

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
  date,
  mobile,
}) {
  const saudaRows = useSaudaRows(company, rateMap);
  const { sellerOptions, companiesBySeller } = useSellerLookups(sellers);
  const topSellerNames = useTopSellerNames(entries, sellers);
  const {
    removeDialog,
    openRemoveDialog,
    closeRemoveDialog,
    handleReasonChange,
    handleConfirmRemove,
  } = useRemoveSaudaDialog({ entries, company, date, mobile, removeRow });

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
            {saudaRows.map((row, index) => {
              const list = entries?.[row.key] || [];
              const enteredTons = totalTons(row.key);
              const remaining =
                row.quantityNum != null ? row.quantityNum - enteredTons : "-";

              return (
                <SaudaRow
                  key={row.key}
                  sl={index + 1}
                  unit={row.unit}
                  commodity={row.commodity}
                  rowKey={row.key}
                  quantityNum={row.quantityNum}
                  newRate={row.newRate}
                  list={list}
                  enteredTons={enteredTons}
                  remaining={remaining}
                  sellerOptions={sellerOptions}
                  companiesBySeller={companiesBySeller}
                  topSellerNames={topSellerNames}
                  saveStatus={saveStatus}
                  handleChange={handleChange}
                  handleUnitSave={handleUnitSave}
                  addRow={addRow}
                  openRemoveDialog={openRemoveDialog}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {removeDialog.open && (
        <Modal onClose={closeRemoveDialog}>
          <div className="p-6 dark:bg-gray-900 dark:text-gray-200">
            <h2 className="text-lg font-semibold mb-4">Are you sure to remove?</h2>
            <div className="mb-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
              {removeDialog.sellerName ? `Seller: ${removeDialog.sellerName}` : "Seller: -"}
            </div>
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
