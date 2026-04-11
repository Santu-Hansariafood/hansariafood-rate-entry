import mongoose from "mongoose";

const RateSchema = new mongoose.Schema({
  company: { type: String, required: true },
  location: { type: String, required: true },
  commodity: { type: String, required: true },
  oldRates: [
    {
      rate: { type: Number, required: true },
      date: { type: Date, required: true },
    },
  ],
  newRate: { type: Number, required: true },
  newRateDate: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now },
  updateTime: { type: String },
  mobile: { type: String },
  quantity: { type: Number },
  payment: { type: String },
  others: { type: String },
});

RateSchema.index({ company: 1, location: 1, commodity: 1 });
RateSchema.index({ company: 1 });
RateSchema.index({ newRateDate: 1 });

RateSchema.pre("save", function (next) {
  const now = new Date();
  
  // Always update updateTime and updatedAt
  this.updateTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  this.updatedAt = now;

  // Only handle oldRates if we're not explicitly handling it elsewhere
  // But wait, it's safer to just handle it in one place.
  // I'll leave this hook for updateTime only to avoid double-pushes
  
  next();
});

export default mongoose.models.Rate || mongoose.model("Rate", RateSchema);
