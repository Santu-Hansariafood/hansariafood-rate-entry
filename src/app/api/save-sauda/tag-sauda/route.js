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
    // Get query parameters for filtering
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
    
    // Calculate and include tagged quantities in the response
    const tagsWithQuantities = await Promise.all(allTags.map(async (tag) => {
      const tagObj = tag.toObject();
      
      // Initialize tagged quantity
      tagObj.taggedQuantity = 0;
      tagObj.linkedSaudaDetails = [];
      
      // For purchase entries, get details of linked sell saudas
      if (tag.type === "purchase" && tag.sellLinkedSauda && tag.sellLinkedSauda.length > 0) {
        try {
          const linkedSaudas = await TagSauda.find({
            saudaNo: { $in: tag.sellLinkedSauda }
          });
          
          tagObj.linkedSaudaDetails = linkedSaudas.map(s => ({
            saudaNo: s.saudaNo,
            tons: s.tons || 0,
            date: s.date
          }));
          
          // Sum the tons from linked saudas
          tagObj.taggedQuantity = linkedSaudas.reduce((sum, s) => sum + (s.tons || 0), 0);
        } catch (err) {
          console.error("Error fetching linked sell saudas:", err);
        }
      }
      
      // For sell entries, get details of linked purchase saudas
      if (tag.type === "sell" && tag.purchaseLinkedSauda && tag.purchaseLinkedSauda.length > 0) {
        try {
          const linkedSaudas = await TagSauda.find({
            saudaNo: { $in: tag.purchaseLinkedSauda }
          });
          
          tagObj.linkedSaudaDetails = linkedSaudas.map(s => ({
            saudaNo: s.saudaNo,
            tons: s.tons || 0,
            date: s.date
          }));
          
          // Sum the tons from linked saudas
          tagObj.taggedQuantity = linkedSaudas.reduce((sum, s) => sum + (s.tons || 0), 0);
        } catch (err) {
          console.error("Error fetching linked purchase saudas:", err);
        }
      }
      
      return tagObj;
    }));
    
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
      taggedBy = "system"
    } = body;

    // Ensure tons is a positive number
    const tonsValue = Math.abs(parseFloat(tons) || 0);

    if (!saudaNo) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 }
      );
    }

    // Process linked sauda numbers
    let processedPurchaseLinkedSauda = purchaseLinkedSauda;
    let processedSellLinkedSauda = sellLinkedSauda;
    
    // If tagSaudaNo is provided, use it based on type
    if (tagSaudaNo && tagSaudaNo.length > 0) {
      if (type === "purchase") {
        processedSellLinkedSauda = tagSaudaNo;
      } else if (type === "sell") {
        processedPurchaseLinkedSauda = tagSaudaNo;
      }
    }

    // Check if entry already exists, update it instead of creating new
    const existing = await TagSauda.findOne({ saudaNo });
    
    if (existing) {
      // Update existing entry with new data
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
      
      // Update linked saudas based on type
      if (type === "purchase") {
        existing.sellLinkedSauda = [...new Set(processedSellLinkedSauda)];
      } else if (type === "sell") {
        existing.purchaseLinkedSauda = [...new Set(processedPurchaseLinkedSauda)];
      }
      
      await existing.save();
      
      // Update the opposite side references
      await updateOppositeReferences(saudaNo, type, processedPurchaseLinkedSauda, processedSellLinkedSauda);
      
      return NextResponse.json(
        { message: "Tag sauda updated successfully", entry: existing },
        { status: 200 }
      );
    }

    // Create new entry
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
      purchaseLinkedSauda: type === "purchase" ? [] : processedPurchaseLinkedSauda,
      sellLinkedSauda: type === "purchase" ? processedSellLinkedSauda : []
    };

    const created = await TagSauda.create(newEntry);
    
    // Update the opposite side references
    await updateOppositeReferences(saudaNo, type, processedPurchaseLinkedSauda, processedSellLinkedSauda);
    
    return NextResponse.json(
      { message: "Tag sauda created successfully", entry: created },
      { status: 201 }
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
      status
    } = body;

    if (!saudaNo) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 }
      );
    }

    const existing = await TagSauda.findOne({ saudaNo });
    if (!existing) {
      return NextResponse.json(
        { error: "Sauda not found" },
        { status: 404 }
      );
    }

    // Store previous linked saudas to handle removed links
    const previousPurchaseLinks = [...existing.purchaseLinkedSauda || []];
    const previousSellLinks = [...existing.sellLinkedSauda || []];

    // Update fields
    Object.keys(body).forEach((key) => {
      if (key !== "saudaNo") {
        existing[key] = body[key];
      }
    });

    await existing.save();

    // Update bidirectional references
    const type = existing.type;
    await updateOppositeReferences(saudaNo, type, purchaseLinkedSauda, sellLinkedSauda);

    // Handle removed links - remove this sauda from the opposite side
    if (type === "purchase") {
      const removedSellLinks = previousSellLinks.filter(
        link => !sellLinkedSauda.includes(link)
      );
      
      // Remove this purchase sauda from the removed sell saudas
      await Promise.all(
        removedSellLinks.map(async (sellNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: sellNo },
            { $pull: { purchaseLinkedSauda: saudaNo } }
          );
        })
      );
    } else if (type === "sell") {
      const removedPurchaseLinks = previousPurchaseLinks.filter(
        link => !purchaseLinkedSauda.includes(link)
      );
      
      // Remove this sell sauda from the removed purchase saudas
      await Promise.all(
        removedPurchaseLinks.map(async (purchaseNo) => {
          await TagSauda.findOneAndUpdate(
            { saudaNo: purchaseNo },
            { $pull: { sellLinkedSauda: saudaNo } }
          );
        })
      );
    }

    return NextResponse.json(
      { message: "Tag sauda updated successfully", entry: existing },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /tag-sauda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to update opposite references
async function updateOppositeReferences(saudaNo, type, purchaseLinkedSauda, sellLinkedSauda) {
  try {
    // Ensure arrays are valid
    const purchaseLinks = Array.isArray(purchaseLinkedSauda) ? purchaseLinkedSauda : [];
    const sellLinks = Array.isArray(sellLinkedSauda) ? sellLinkedSauda : [];
    
    console.log(`Updating references for ${saudaNo} (${type}):`, { 
      purchaseLinks, 
      sellLinks 
    });
    
    // Purchase links sell side
    if (type === "purchase" && sellLinks.length > 0) {
      await Promise.all(
        sellLinks.map(async (sellNo) => {
          if (!sellNo) return; // Skip empty values
          
          console.log(`Linking purchase ${saudaNo} to sell ${sellNo}`);
          await TagSauda.findOneAndUpdate(
            { saudaNo: sellNo },
            {
              $setOnInsert: { type: "sell", taggedBy: "system" },
              $addToSet: { purchaseLinkedSauda: saudaNo },
            },
            { new: true, upsert: true }
          );
        })
      );
    }

    // Sell links purchase side
    if (type === "sell" && purchaseLinks.length > 0) {
      await Promise.all(
        purchaseLinks.map(async (purchaseNo) => {
          if (!purchaseNo) return; // Skip empty values
          
          console.log(`Linking sell ${saudaNo} to purchase ${purchaseNo}`);
          await TagSauda.findOneAndUpdate(
            { saudaNo: purchaseNo },
            {
              $setOnInsert: { type: "purchase", taggedBy: "system" },
              $addToSet: { sellLinkedSauda: saudaNo },
            },
            { new: true, upsert: true }
          );
        })
      );
    }
  } catch (error) {
    console.error("Error updating opposite references:", error);
    throw error; // Propagate error to caller
  }
}
