"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { toast } from "@/utils/toast/toast";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import {
  FREIGHT_COMMODITIES,
  freightRouteKey,
  matchesFreightCommodity,
  normalizeFreightValue,
} from "@/utils/freight";

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

export default function FreightBulkUpload({
  isOpen,
  onClose,
  companies,
  selectedCommodity,
  fetchAllFreights,
  refreshFreights,
  currentUser,
}) {
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [skipExisting, setSkipExisting] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setRows([]);
      setSummary(null);
      setSkipExisting(true);
    }
  }, [isOpen]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLoadingFile(true);
    setRows([]);
    setSummary(null);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sourceRows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });

      if (sourceRows.length === 0) {
        toast.error("The selected sheet has no freight rows");
        return;
      }
      if (sourceRows.length > 1000) {
        toast.error("Upload files can contain up to 1000 rows");
        return;
      }

      const existingFreights = await fetchAllFreights();
      const existingRoutes = new Map(
        existingFreights.map((freight) => [
          freightRouteKey(freight),
          freight,
        ])
      );
      const commodityByName = new Map(
        FREIGHT_COMMODITIES.map((commodity) => [
          normalizeFreightValue(commodity),
          commodity,
        ])
      );
      const seenRoutes = new Set();
      const parsedRows = sourceRows.map((sourceRow, index) => {
        if (
          Object.values(sourceRow).every(
            (value) => String(value).trim() === ""
          )
        ) {
          return null;
        }

        const cells = new Map(
          Object.entries(sourceRow).map(([header, value]) => [
            normalizeHeader(header),
            value,
          ])
        );
        const getCell = (...headers) => {
          for (const header of headers) {
            const value = cells.get(normalizeHeader(header));
            if (value !== undefined && String(value).trim() !== "") return value;
          }
          return "";
        };
        const rowNumber = index + 2;
        const rowCommodity = getCell("Commodity");
        const commodityName =
          rowCommodity ||
          (commodityByName.has(normalizeFreightValue(sheetName))
            ? sheetName
            : selectedCommodity);
        const commodity = commodityByName.get(
          normalizeFreightValue(commodityName)
        );
        const sourceLocationName = String(
          getCell("Source Location", "Location")
        ).trim();
        const destinationLocationName = String(
          getCell("Destination Location", "Delivery Location")
        ).trim();
        const sourceCompanyName = normalizeFreightValue(
          getCell("Source Company", "Seller Company", "Company")
        );
        const destinationCompanyName = normalizeFreightValue(
          getCell(
            "Destination Company",
            "Buyer Company",
            "Delivery Company"
          )
        );
        const sellers = companies.filter(
          (company) =>
            company.type?.includes("seller") &&
            matchesFreightCommodity(company.commodities, commodity)
        );
        const buyers = companies.filter(
          (company) =>
            company.type?.includes("buyer") &&
            matchesFreightCommodity(company.commodities, commodity)
        );
        const findCompany = (eligible, name, location) => {
          const named = name
            ? eligible.filter(
                (company) =>
                  normalizeFreightValue(company.name) === name
              )
            : eligible;
          const matches = named
            .map((company) => ({
              company,
              location: company.location?.find(
                (entry) =>
                  normalizeFreightValue(entry) ===
                  normalizeFreightValue(location)
              ),
            }))
            .filter((entry) => entry.location);
          return matches.length === 1
            ? matches[0]
            : { ambiguous: matches.length > 1 };
        };
        const source = commodity
          ? findCompany(sellers, sourceCompanyName, sourceLocationName)
          : null;
        const destination = commodity
          ? findCompany(buyers, destinationCompanyName, destinationLocationName)
          : null;
        const rawRate = String(getCell("Freight Rate", "Rate"))
          .replace(/[₹,\s]/g, "")
          .trim();
        const freightRate = Number(rawRate);
        const errors = [];

        if (!commodity) errors.push("Unknown or missing commodity");
        if (!sourceLocationName) errors.push("Missing source location");
        if (!destinationLocationName) errors.push("Missing destination location");
        if (source?.ambiguous) errors.push("Source company is ambiguous");
        else if (!source) errors.push("Source company/location not found");
        if (destination?.ambiguous) {
          errors.push("Destination company is ambiguous");
        } else if (!destination) {
          errors.push("Destination company/location not found");
        }
        if (
          sourceLocationName &&
          normalizeFreightValue(sourceLocationName) ===
            normalizeFreightValue(destinationLocationName)
        ) {
          errors.push("Source and destination locations must differ");
        }
        if (!rawRate || !Number.isFinite(freightRate) || freightRate <= 0) {
          errors.push("Freight rate must be greater than zero");
        }

        const row = {
          rowNumber,
          commodity: commodity || commodityName,
          company: source?.company?._id,
          companyName: source?.company?.name || sourceCompanyName,
          location: source?.location || sourceLocationName,
          deliveryCompany: destination?.company?._id,
          deliveryCompanyName:
            destination?.company?.name || destinationCompanyName,
          deliveryLocation:
            destination?.location || destinationLocationName,
          freightRate,
          errors,
        };
        const key =
          source?.company && destination?.company && commodity
            ? freightRouteKey({
                commodity,
                company: source.company._id,
                location: row.location,
                deliveryCompany: destination.company._id,
                deliveryLocation: row.deliveryLocation,
              })
            : null;

        if (key && seenRoutes.has(key)) {
          row.duplicateInFile = true;
        } else if (key) {
          seenRoutes.add(key);
          row.existing = existingRoutes.get(key) || null;
        }
        return row;
      });

      const nonEmptyRows = parsedRows.filter(
        Boolean
      );
      if (nonEmptyRows.length === 0) {
        toast.error("No freight data rows were found in the selected sheet");
        return;
      }
      setRows(nonEmptyRows);
    } catch (error) {
      console.error("Error reading freight upload file:", error);
      toast.error(error.response?.data?.error || "Failed to read freight file");
    } finally {
      setLoadingFile(false);
    }
  };

  const handleUpload = async () => {
    const validRows = rows.filter(
      (row) => row.errors.length === 0 && !row.duplicateInFile
    );
    if (validRows.length === 0) {
      toast.error("There are no valid freight rows to upload");
      return;
    }

    setUploading(true);
    try {
      const response = await axiosInstance.post("/freight/bulk", {
        rows: validRows,
        skipExisting,
        createdBy: currentUser?.name || "Unknown",
      });
      const resultByRow = new Map(
        response.data.results.map((result) => [result.rowNumber, result])
      );
      setRows((current) =>
        current.map((row) => ({
          ...row,
          uploadResult: resultByRow.get(row.rowNumber),
        }))
      );
      setSummary(response.data.summary);
      await refreshFreights();

      const { created, updated, skipped, failed } = response.data.summary;
      toast.success(
        `Bulk upload complete: ${created} added, ${updated} updated, ${skipped} skipped, ${failed} failed`
      );
    } catch (error) {
      console.error("Error uploading freight file:", error);
      toast.error(error.response?.data?.error || "Failed to upload freight file");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const statusLabel = (row) => {
    if (row.uploadResult) {
      return `${row.uploadResult.status}: ${row.uploadResult.message}`;
    }
    if (row.errors.length > 0) return row.errors.join("; ");
    if (row.duplicateInFile) return "Repeated in this file — will not upload";
    if (row.existing) return `Already loaded (₹${row.existing.freightRate})`;
    return "Ready to upload";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="freight-bulk-upload-title"
    >
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="freight-bulk-upload-title"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Bulk Upload Freight Rates
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload the template or a missing-routes workbook. Existing routes
              are identified before import.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bulk upload"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingFile || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loadingFile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Choose Excel File
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Up to 1000 records per upload
          </span>
        </div>

        {rows.length > 0 && (
          <>
            <div className="mt-5 flex flex-col gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={(event) => setSkipExisting(event.target.checked)}
                  className="accent-emerald-600"
                />
                Skip existing freight routes
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Uncheck to update an existing route with the uploaded rate.
              </span>
            </div>

            {summary && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {summary.created} added · {summary.updated} updated ·{" "}
                {summary.skipped} skipped · {summary.failed} failed
              </div>
            )}

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  <tr>
                    {[
                      "Row",
                      "Commodity",
                      "Source",
                      "Destination",
                      "Rate",
                      "Status",
                    ].map((heading) => (
                      <th key={heading} className="px-3 py-2.5 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="px-3 py-2">{row.rowNumber}</td>
                      <td className="px-3 py-2">{row.commodity}</td>
                      <td className="px-3 py-2">
                        {row.companyName} — {row.location}
                      </td>
                      <td className="px-3 py-2">
                        {row.deliveryCompanyName} — {row.deliveryLocation}
                      </td>
                      <td className="px-3 py-2">
                        {Number.isFinite(row.freightRate)
                        && row.freightRate > 0
                          ? `₹${row.freightRate}`
                          : "—"}
                      </td>
                      <td
                        className={`max-w-xs px-3 py-2 ${
                          row.errors.length > 0 ||
                          row.uploadResult?.status === "failed"
                            ? "text-red-600 dark:text-red-400"
                            : row.existing || row.duplicateInFile
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {statusLabel(row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Close
          </button>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={
                uploading ||
                loadingFile ||
                rows.every(
                  (row) => row.errors.length > 0 || row.duplicateInFile
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload Valid Rows"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
