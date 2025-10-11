import mongoose from "mongoose";

const TagSaudaSchema = new mongoose.Schema(
  {
    saudaNo: { type: String, required: true },
    date: { type: String, required: true },
    unit: { type: String, required: true },
    buyer: { type: String, default: "" },
    seller: { type: String, default: "" },
    sellerName: { type: String, default: "" },
    sellerCompany: { type: String, default: "" },
    commodity: { type: String, required: true },
    tons: { type: Number, required: true },
    finalRate: { type: Number, required: true },
    type: { type: String, enum: ["purchase", "sell"], required: true },
    tagSaudaNo: [
      {
        saudaNo: { type: String },
        qty: { type: Number, default: 0 },
      },
    ],

    purchaseLinkedSauda: [{ type: String, default: [] }],
    sellLinkedSauda: [{ type: String, default: [] }],

    status: {
      type: String,
      enum: ["Pending", "Complete"],
      default: "Pending",
    },

    taggedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

export default mongoose.models.TagSauda ||
  mongoose.model("TagSauda", TagSaudaSchema);
