import mongoose from "mongoose";

const TagSaudaSchema = new mongoose.Schema(
  {
    saudaNo: { type: String, required: true, unique: true },
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
    tagSaudaNo: [{ type: String }],
    purchaseLinkedSauda: {
      type: [String],
      default: [],
    },
    sellLinkedSauda: {
      type: [String],
      default: [],
    },

    taggedBy: { type: String, default: "system" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.TagSauda ||
  mongoose.model("TagSauda", TagSaudaSchema);
