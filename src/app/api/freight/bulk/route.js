import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Freight from "@/models/Freight";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";
import {
  FREIGHT_COMMODITIES,
  freightRouteKey,
  matchesFreightCommodity,
  normalizeFreightValue,
} from "@/utils/freight";

export async function POST(req) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const body = await req.json();
    const { rows, skipExisting = true, createdBy = "Unknown" } = body;

    if (!Array.isArray(rows) || rows.length === 0 || rows.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Upload between 1 and 1000 freight rows" },
        { status: 400 }
      );
    }

    const commodityMap = new Map(
      FREIGHT_COMMODITIES.map((commodity) => [
        commodity.toLowerCase(),
        commodity,
      ])
    );
    const results = [];
    const candidates = [];

    rows.forEach((row, index) => {
      if (!row || typeof row !== "object") {
        results.push({
          rowNumber: index + 2,
          status: "failed",
          message: "Invalid freight row",
        });
        return;
      }

      const rowNumber = Number(row.rowNumber) || index + 2;
      const commodity = commodityMap.get(
        String(row.commodity || "").trim().toLowerCase()
      );
      const freightRate = Number(row.freightRate);
      const requiredValues = [
        row.company,
        row.location,
        row.deliveryCompany,
        row.deliveryLocation,
      ];

      if (
        !commodity ||
        requiredValues.some((value) => !String(value || "").trim()) ||
        !Number.isFinite(freightRate) ||
        freightRate <= 0 ||
        normalizeFreightValue(row.location) ===
          normalizeFreightValue(row.deliveryLocation) ||
        !mongoose.isValidObjectId(row.company) ||
        !mongoose.isValidObjectId(row.deliveryCompany)
      ) {
        results.push({
          rowNumber,
          status: "failed",
          message: "Invalid commodity, company, location, or freight rate",
        });
        return;
      }

      candidates.push({
        ...row,
        rowNumber,
        commodity,
        freightRate,
        location: String(row.location).trim(),
        deliveryLocation: String(row.deliveryLocation).trim(),
      });
    });

    const companyIds = [
      ...new Set(
        candidates.flatMap((row) => [row.company, row.deliveryCompany])
      ),
    ];
    const companyDocuments = await ManageCompany.find({
      _id: { $in: companyIds },
    }).lean();
    const companyById = new Map(
      companyDocuments.map((company) => [String(company._id), company])
    );
    const validCandidates = [];

    candidates.forEach((row) => {
      const sourceCompany = companyById.get(String(row.company));
      const destinationCompany = companyById.get(String(row.deliveryCompany));
      const validSource =
        sourceCompany?.type?.includes("seller") &&
        sourceCompany.location?.includes(row.location) &&
        matchesFreightCommodity(sourceCompany.commodities, row.commodity);
      const validDestination =
        destinationCompany?.type?.includes("buyer") &&
        destinationCompany.location?.includes(row.deliveryLocation) &&
        matchesFreightCommodity(
          destinationCompany.commodities,
          row.commodity
        );

      if (!validSource || !validDestination) {
        results.push({
          rowNumber: row.rowNumber,
          status: "failed",
          message: "Company type, commodity, or location does not match",
        });
        return;
      }

      validCandidates.push(row);
    });

    const sourceIds = [...new Set(validCandidates.map((row) => row.company))];
    const destinationIds = [
      ...new Set(validCandidates.map((row) => row.deliveryCompany)),
    ];
    const existingDocuments = await Freight.find({
      commodity: { $in: [...new Set(validCandidates.map((row) => row.commodity))] },
      company: { $in: sourceIds },
      deliveryCompany: { $in: destinationIds },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();
    const existingByKey = new Map();
    existingDocuments.forEach((freight) => {
      const key = freightRouteKey(freight);
      if (!existingByKey.has(key)) existingByKey.set(key, freight);
    });
    const seenRoutes = new Set();

    for (const row of validCandidates) {
      const key = freightRouteKey(row);
      if (seenRoutes.has(key)) {
        results.push({
          rowNumber: row.rowNumber,
          status: "skipped",
          message: "Duplicate route in uploaded file",
        });
        continue;
      }
      seenRoutes.add(key);

      const existing = existingByKey.get(key);
      if (existing && skipExisting) {
        results.push({
          rowNumber: row.rowNumber,
          status: "skipped",
          message: "Freight route already exists",
        });
        continue;
      }

      try {
        if (existing) {
          await Freight.findByIdAndUpdate(existing._id, {
            $set: {
              freightRate: row.freightRate,
              previousRate: existing.freightRate,
            },
          });
          results.push({
            rowNumber: row.rowNumber,
            status: "updated",
            message: "Existing freight rate updated",
          });
        } else {
          const created = await Freight.create({
            commodity: row.commodity,
            company: row.company,
            location: row.location,
            deliveryCompany: row.deliveryCompany,
            deliveryLocation: row.deliveryLocation,
            freightRate: row.freightRate,
            previousRate: row.freightRate,
            createdBy: String(createdBy || "Unknown"),
          });
          existingByKey.set(key, created.toObject());
          results.push({
            rowNumber: row.rowNumber,
            status: "created",
            message: "Freight rate added",
          });
        }
      } catch (error) {
        console.error(`Failed to import freight row ${row.rowNumber}:`, error);
        results.push({
          rowNumber: row.rowNumber,
          status: "failed",
          message: "Failed to save freight rate",
        });
      }
    }

    const summary = results.reduce(
      (counts, result) => {
        counts[result.status] += 1;
        return counts;
      },
      { created: 0, updated: 0, skipped: 0, failed: 0 }
    );

    return NextResponse.json({ success: true, summary, results });
  } catch (error) {
    console.error("POST /freight/bulk error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import freight rates" },
      { status: 500 }
    );
  }
}
