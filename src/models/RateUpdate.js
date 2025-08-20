import mongoose from "mongoose";

const rateUpdateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  companies: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

rateUpdateSchema.index({ date: 1 }, { unique: true });

const RateUpdate =
  mongoose.models.RateUpdate || mongoose.model("RateUpdate", rateUpdateSchema);

export default RateUpdate;
