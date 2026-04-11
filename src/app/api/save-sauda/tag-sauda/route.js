import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TagSauda from "@/models/TagSauda";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  await connectDB();

  const authorized = await verifyApiKey(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const saudaNo = searchParams.get("saudaNo");
    const type = searchParams.get("type");

    let query = {};

    if (saudaNo) {
      query.saudaNo = saudaNo;
    }

    if (type) {
      query.type = type;
    }

    const allTags = await TagSauda.find(query).sort({ createdAt: -1 });

    const tagsWithQuantities = await Promise.all(
      allTags.map(async (tag) => {
        const tagObj = tag.toObject();

        tagObj.taggedQuantity = 0;
        tagObj.linkedSaudaDetails = [];

        if (
          tag.type === "purchase" &&
          tag.sellLinkedSauda &&
          tag.sellLinkedSauda.length > 0
        ) {
          try {
            const linkedSaudas = await TagSauda.find({
              saudaNo: { $in: tag.sellLinkedSauda },
            });

            tagObj.linkedSaudaDetails = linkedSaudas.map((s) => ({
              saudaNo: s.saudaNo,
              tons: s.tons || 0,
              date: s.date,
            }));

            tagObj.taggedQuantity = linkedSaudas.reduce(
              (sum, s) => sum + (s.tons || 0),
              0,
            );
          } catch (err) {
            console.error("Error fetching linked sell saudas:", err);
          }
        }

        if (
          tag.type === "sell" &&
          tag.purchaseLinkedSauda &&
          tag.purchaseLinkedSauda.length > 0
        ) {
          try {
            const linkedSaudas = await TagSauda.find({
              saudaNo: { $in: tag.purchaseLinkedSauda },
            });

            tagObj.linkedSaudaDetails = linkedSaudas.map((s) => ({
              saudaNo: s.saudaNo,
              tons: s.tons || 0,
              date: s.date,
            }));

            tagObj.taggedQuantity = linkedSaudas.reduce(
              (sum, s) => sum + (s.tons || 0),
              0,
            );
          } catch (err) {
            console.error("Error fetching linked purchase saudas:", err);
          }
        }

        return tagObj;
      }),
    );

    return NextResponse.json(tagsWithQuantities, { status: 200 });
  } catch (error) {
    console.error("Error in GET /tag-sauda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();

  const authorized = await verifyApiKey(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    console.log("Received payload:", JSON.stringify(body));

    const {
      saudaNo,
      date,
      unit,
      commodity,
      tons,
      finalRate,
      type,
      tagSaudaNo = [],
      purchaseLinkedSauda = [],
      sellLinkedSauda = [],
      status = "Pending",
      buyer = "",
      seller = "",
      sellerName = "",
      sellerCompany = "",
      taggedBy = "system",
    } = body;

    const tonsValue = Math.abs(parseFloat(tons) || 0);

    if (!saudaNo) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 },
      );
    }

    let processedPurchaseLinkedSauda = purchaseLinkedSauda;
    let processedSellLinkedSauda = sellLinkedSauda;

    if (tagSaudaNo && tagSaudaNo.length > 0) {
      if (type === "purchase") {
        processedSellLinkedSauda = tagSaudaNo;
      } else if (type === "sell") {
        processedPurchaseLinkedSauda = tagSaudaNo;
      }
    }

    const existing = await TagSauda.findOne({ saudaNo });

    if (existing) {
      if (date) existing.date = date;
      if (unit) existing.unit = unit;
      if (commodity) existing.commodity = commodity;
      if (tons) existing.tons = tonsValue;
      if (finalRate) existing.finalRate = finalRate;
      if (type) existing.type = type;
      if (status) existing.status = status;
      if (buyer) existing.buyer = buyer;
      if (seller) existing.seller = seller;
      if (sellerName) existing.sellerName = sellerName;
      if (sellerCompany) existing.sellerCompany = sellerCompany;
      if (taggedBy) existing.taggedBy = taggedBy;

      if (type === "purchase") {
        existing.sellLinkedSauda = [...new Set(processedSellLinkedSauda)];
      } else if (type === "sell") {
        existing.purchaseLinkedSauda = [
          ...new Set(processedPurchaseLinkedSauda),
        ];
      }

      await existing.save();

      await updateOppositeReferences(
        saudaNo,
        type,
        processedPurchaseLinkedSauda,
        processedSellLinkedSauda,
      );

      return NextResponse.json(
        { message: "Tag sauda updated successfully", entry: existing },
        { status: 200 },
      );
    }

    const newEntry = {
      saudaNo,
      date,
      unit,
      commodity,
      tons: tonsValue,
      finalRate,
      type,
      status,
      buyer,
      seller,
      sellerName,
      sellerCompany,
      taggedBy,
      purchaseLinkedSauda:
        type === "purchase" ? [] : processedPurchaseLinkedSauda,
      sellLinkedSauda: type === "purchase" ? processedSellLinkedSauda : [],
    };

    const created = await TagSauda.create(newEntry);

    await updateOppositeReferences(
      saudaNo,
      type,
      processedPurchaseLinkedSauda,
      processedSellLinkedSauda,
    );

    return NextResponse.json(
      { message: "Tag sauda created successfully", entry: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /tag-sauda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();

  const authorized = await verifyApiKey(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      saudaNo,
      purchaseLinkedSauda = [],
      sellLinkedSauda = [],
      status,
    } = body;

    if (!saudaNo) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 },
      );
    }

    const existing = await TagSauda.findOne({ saudaNo });
    if (!existing) {
      return NextResponse.json({ error: "Sauda not found" }, { status: 404 });
    }

    const previousPurchaseLinks = [...(existing.purchaseLinkedSauda || [])];
    const previousSellLinks = [...(existing.sellLinkedSauda || [])];

    Object.keys(body).forEach((key) => {
      if (key !== "saudaNo") {
        existing[key] = body[key];
      }
    });

    await existing.save();

    const type = existing.type;
    await updateOppositeReferences(
      saudaNo,
      type,
      purchaseLinkedSauda,
      sellLinkedSauda,
    );

    if (type === "purchase") {
      const removedSellLinks = previousSellLinks.filter(
        (link) => !sellLinkedSauda.includes(link),
      );

      await Promise.all(
        removedSellLinks.map(async (sellNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: sellNo },
            { $pull: { purchaseLinkedSauda: saudaNo } },
          );
        }),
      );
    } else if (type === "sell") {
      const removedPurchaseLinks = previousPurchaseLinks.filter(
        (link) => !purchaseLinkedSauda.includes(link),
      );

      await Promise.all(
        removedPurchaseLinks.map(async (purchaseNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: purchaseNo },
            { $pull: { sellLinkedSauda: saudaNo } },
          );
        }),
      );
    }

    return NextResponse.json(
      { message: "Tag sauda updated successfully", entry: existing },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in PUT /tag-sauda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateOppositeReferences(
  saudaNo,
  type,
  purchaseLinkedSauda,
  sellLinkedSauda,
) {
  try {
    const purchaseLinks = Array.isArray(purchaseLinkedSauda)
      ? purchaseLinkedSauda
      : [];
    const sellLinks = Array.isArray(sellLinkedSauda) ? sellLinkedSauda : [];

    console.log(`Updating references for ${saudaNo} (${type}):`, {
      purchaseLinks,
      sellLinks,
    });

    if (type === "purchase" && sellLinks.length > 0) {
      await Promise.all(
        sellLinks.map(async (sellNo) => {
          if (!sellNo) return;

          console.log(`Linking purchase ${saudaNo} to sell ${sellNo}`);
          await TagSauda.findOneAndUpdate(
            { saudaNo: sellNo },
            {
              $setOnInsert: { type: "sell", taggedBy: "system" },
              $addToSet: { purchaseLinkedSauda: saudaNo },
            },
            { new: true, upsert: true },
          );
        }),
      );
    }

    if (type === "sell" && purchaseLinks.length > 0) {
      await Promise.all(
        purchaseLinks.map(async (purchaseNo) => {
          if (!purchaseNo) return;

          console.log(`Linking sell ${saudaNo} to purchase ${purchaseNo}`);
          await TagSauda.findOneAndUpdate(
            { saudaNo: purchaseNo },
            {
              $setOnInsert: { type: "purchase", taggedBy: "system" },
              $addToSet: { sellLinkedSauda: saudaNo },
            },
            { new: true, upsert: true },
          );
        }),
      );
    }
  } catch (error) {
    console.error("Error updating opposite references:", error);
    throw error;
  }
}
