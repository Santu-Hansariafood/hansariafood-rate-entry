import mongoose from "mongoose";

const SaudaStatusSchema = new mongoose.Schema(
  {
    saudaNo: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Pending", "Done"], default: "Pending" },
    unit: String,
    commodity: String,
    sellerName: String,
    sellerCompany: String,
  },
  { timestamps: true }
);

export default mongoose.models.SaudaStatus ||
  mongoose.model("SaudaStatus", SaudaStatusSchema);
