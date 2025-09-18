import mongoose from "mongoose";

const SaudaSchema = new mongoose.Schema({
  saudaNo: { type: String, required: true },
  consigneeName: String,
  consigneeCompany: String,
  sellerName: String,
  sellerCompany: String,
  unit: String,
  tons: Number,
  finalRate: Number,
  tag: String,
});

const CommoditySchema = new mongoose.Schema({
  commodity: { type: String, required: true },
  totalTons: Number,
  saudas: [SaudaSchema],
});

const PurchaseSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    unit: { type: String, required: true },
    commodities: [CommoditySchema],
    tag: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Purchase ||
  mongoose.model("Purchase", PurchaseSchema);
