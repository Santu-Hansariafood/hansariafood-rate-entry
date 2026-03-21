import mongoose from "mongoose";

const TempRateSchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true },
    time: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const HistorySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },

    oldRate: {
      type: Number,
      default: 0,
    },

    tempRates: {
      type: [TempRateSchema],
      default: [],
    },

    finalRate: {
      type: Number,
      default: null,
    },

    others: {
      type: String,
      default: "",
    },

    destinationLocation: {
      type: String,
      default: "",
    },

    freightRate: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const RateHistorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManageCompany",
      required: true,
      index: true,
    },
    location: { type: String, required: true },
    commodity: { type: String, required: true },
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

RateHistorySchema.index({ commodity: 1 });
RateHistorySchema.index({ "history.date": 1 });

export default mongoose.models.RateHistory ||
  mongoose.model("RateHistory", RateHistorySchema);
