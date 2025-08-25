import mongoose from "mongoose";

const saudaEntrySubSchema = new mongoose.Schema(
  {
    tons: { type: Number, required: true },
    others: { type: String, default: "" },
    saudaNo: { type: String, default: "" },
    finalRate: { type: Number, default: 0 },
    unit: { type: String, required: true },
    commodity: { type: String, required: true },
    sellerName: { type: String, default: "" },
    sellerCompany: { type: String, default: "" },
  },
  { _id: false }
);

const SaudaEntrySchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    buyer: { type: String },
    seller: { type: String },
    date: { type: String, required: true },
    time: { type: String },
    saudaEntries: {
      type: Map,
      of: [saudaEntrySubSchema],
    },
    lastUpdated: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SaudaEntry ||
  mongoose.model("SaudaEntry", SaudaEntrySchema);
