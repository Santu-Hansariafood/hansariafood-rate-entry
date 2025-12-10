import mongoose from "mongoose";

const RateHistorySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "ManageCompany", required: true },
    location: { type: String, required: true },
    commodity: { type: String, required: true },
    newRate: { type: Number, default: 0 },
    oldRate: { type: Number, default: 0 },
    history: [
      {
        date: { type: String },
        rate: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.RateHistory ||
  mongoose.model("RateHistory", RateHistorySchema);
