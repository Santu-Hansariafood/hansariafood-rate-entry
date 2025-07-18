import mongoose from "mongoose";

const descriptionStatsSchema = new mongoose.Schema({
  description: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  totalQuantity: { type: Number, default: 0 },
  lastUsedDate: { type: Date, default: Date.now },
});

export default mongoose.models.DescriptionStats ||
  mongoose.model("DescriptionStats", descriptionStatsSchema);
