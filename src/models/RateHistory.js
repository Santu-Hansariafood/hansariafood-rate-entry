import mongoose from "mongoose";

const RateHistorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManageCompany",
      required: true,
    },
    location: { type: String, required: true },
    commodity: { type: String, required: true },

    history: [
      {
        date: { type: String, required: true },
        rate: { type: Number, required: true },
        others: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.RateHistory ||
  mongoose.model("RateHistory", RateHistorySchema);
