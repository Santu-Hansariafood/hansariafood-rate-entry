import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TagSauda from "@/models/TagSauda";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req, { params }) {
  await connectDB();

  const authorized = await verifyApiKey(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;

    const entry = await TagSauda.findOne({
      saudaNo: isNaN(id) ? id : Number(id),
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Tag sauda not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    console.error("Error in GET /tag-sauda/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();

  const authorized = await verifyApiKey(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const body = await req.json();

    const saudaNo = isNaN(id) ? id : Number(id);
    const {
      type, // "purchase" or "sell"
      sellLinkedSauda = [],
      purchaseLinkedSauda = [],
      taggedBy,
    } = body;

    // Fetch or create the main entry
    let mainEntry = await TagSauda.findOne({ saudaNo });

    if (!mainEntry) {
      mainEntry = await TagSauda.create({
        saudaNo,
        type,
        taggedBy,
        sellLinkedSauda: [],
        purchaseLinkedSauda: [],
      });
    }

    // Update directional link
    if (type === "purchase" && sellLinkedSauda.length > 0) {
      // Link sells to this purchase
      mainEntry.sellLinkedSauda = [...new Set(sellLinkedSauda)];

      // Also ensure each sell points back to this purchase
      await Promise.all(
        sellLinkedSauda.map(async (sellNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: sellNo },
            {
              $setOnInsert: { type: "sell", taggedBy },
              $addToSet: { purchaseLinkedSauda: saudaNo },
            },
            { new: true, upsert: true }
          );
        })
      );
    } else if (type === "sell" && purchaseLinkedSauda.length > 0) {
      // Link purchases to this sell
      mainEntry.purchaseLinkedSauda = [...new Set(purchaseLinkedSauda)];

      // Ensure each purchase points to this sell
      await Promise.all(
        purchaseLinkedSauda.map(async (purchaseNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: purchaseNo },
            {
              $setOnInsert: { type: "purchase", taggedBy },
              $addToSet: { sellLinkedSauda: saudaNo },
            },
            { new: true, upsert: true }
          );
        })
      );
    }

    await mainEntry.save();

    return NextResponse.json(
      {
        message: "Sauda tags updated successfully",
        entry: mainEntry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /tag-sauda/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  const authorized = await verifyApiKey(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const saudaNo = isNaN(id) ? id : Number(id);

    const entry = await TagSauda.findOne({ saudaNo });
    if (!entry)
      return NextResponse.json(
        { error: "Tag sauda not found" },
        { status: 404 }
      );

    // Remove linkage in opposite saudas
    if (entry.type === "purchase" && entry.sellLinkedSauda?.length) {
      await TagSauda.updateMany(
        { saudaNo: { $in: entry.sellLinkedSauda } },
        { $pull: { purchaseLinkedSauda: saudaNo } }
      );
    } else if (entry.type === "sell" && entry.purchaseLinkedSauda?.length) {
      await TagSauda.updateMany(
        { saudaNo: { $in: entry.purchaseLinkedSauda } },
        { $pull: { sellLinkedSauda: saudaNo } }
      );
    }

    await TagSauda.deleteOne({ saudaNo });

    return NextResponse.json(
      { message: "Tag sauda deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /tag-sauda/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
