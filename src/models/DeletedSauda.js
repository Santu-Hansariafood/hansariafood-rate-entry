import mongoose from "mongoose";

const DeletedSaudaSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    saudaNo: { type: String, default: "" },
    unit: { type: String, required: true },
    commodity: { type: String, required: true },
    tons: { type: Number, required: true },
    finalRate: { type: Number, default: 0 },
    sellerName: { type: String, default: "" },
    sellerCompany: { type: String, default: "" },
    deliveryDate: { type: String, default: "" },
    others: { type: String, default: "" },
    deletedReason: { type: String, default: "" },
    deletedByName: { type: String, default: "" },
    deletedByEmail: { type: String, default: "" },
    deletedByMobile: { type: String, default: "" },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DeletedSaudaSchema.index({ saudaNo: 1 });
DeletedSaudaSchema.index({ date: 1, company: 1 });

export default mongoose.models.DeletedSauda ||
  mongoose.model("DeletedSauda", DeletedSaudaSchema);

