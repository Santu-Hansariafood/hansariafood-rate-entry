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

    const entry = await TagSauda.findOne({ saudaNo: id });
    if (!entry)
      return NextResponse.json(
        { error: "Tag sauda not found" },
        { status: 404 }
      );

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

    const {
      type,
      sellLinkedSauda = [],
      purchaseLinkedSauda = [],
      taggedBy = "system",
    } = body;

    let mainEntry = await TagSauda.findOne({ saudaNo: id });

    if (!mainEntry) {
      mainEntry = await TagSauda.create({
        saudaNo: id,
        type,
        taggedBy,
        sellLinkedSauda: [],
        purchaseLinkedSauda: [],
      });
    }

    if (type === "purchase" && sellLinkedSauda.length > 0) {
      mainEntry.sellLinkedSauda = [...new Set(sellLinkedSauda)];

      await Promise.all(
        sellLinkedSauda.map(async (sellNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: sellNo },
            {
              $setOnInsert: { type: "sell", taggedBy },
              $addToSet: { purchaseLinkedSauda: id },
            },
            { new: true, upsert: true }
          );
        })
      );
    }

    if (type === "sell" && purchaseLinkedSauda.length > 0) {
      mainEntry.purchaseLinkedSauda = [...new Set(purchaseLinkedSauda)];

      await Promise.all(
        purchaseLinkedSauda.map(async (purchaseNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: purchaseNo },
            {
              $setOnInsert: { type: "purchase", taggedBy },
              $addToSet: { sellLinkedSauda: id },
            },
            { new: true, upsert: true }
          );
        })
      );
    }

    await mainEntry.save();

    return NextResponse.json(
      { message: "Sauda tags updated successfully", entry: mainEntry },
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

    const entry = await TagSauda.findOne({ saudaNo: id });
    if (!entry)
      return NextResponse.json(
        { error: "Tag sauda not found" },
        { status: 404 }
      );

    if (entry.type === "purchase" && entry.sellLinkedSauda?.length) {
      await TagSauda.updateMany(
        { saudaNo: { $in: entry.sellLinkedSauda } },
        { $pull: { purchaseLinkedSauda: id } }
      );
    } else if (entry.type === "sell" && entry.purchaseLinkedSauda?.length) {
      await TagSauda.updateMany(
        { saudaNo: { $in: entry.purchaseLinkedSauda } },
        { $pull: { sellLinkedSauda: id } }
      );
    }

    await TagSauda.deleteOne({ saudaNo: id });

    return NextResponse.json(
      { message: "Tag sauda deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /tag-sauda/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
