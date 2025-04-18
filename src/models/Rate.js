import mongoose from "mongoose";

const RateSchema = new mongoose.Schema({
  company: { type: String, required: true },
  location: { type: String, required: true },
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
});

RateSchema.pre("save", function (next) {
  const now = new Date();

  const ISTOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + ISTOffset);

  this.updateTime = istTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const today = new Date(istTime);
  today.setHours(0, 0, 0, 0);

  const lastUpdated = new Date(this.newRateDate);
  lastUpdated.setHours(0, 0, 0, 0);

  if (lastUpdated < today) {
    this.oldRates.push({
      rate: this.newRate,
      date: this.newRateDate,
    });

    this.newRateDate = today;
  }

  this.updatedAt = now;
  next();
});

export default mongoose.models.Rate || mongoose.model("Rate", RateSchema);
