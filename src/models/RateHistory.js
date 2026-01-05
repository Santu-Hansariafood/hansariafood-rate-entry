import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    rate: { type: Number, required: true },
    others: { type: String, default: "" },
  },
  { _id: false }
);

const RateHistorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    location: { type: String, required: true },
    commodity: { type: String, required: true },
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.RateHistory ||
  mongoose.model("RateHistory", RateHistorySchema);
