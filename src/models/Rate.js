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
});

// Middleware to move newRate to oldRates if the date changes
RateSchema.pre("save", function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastUpdated = new Date(this.newRateDate);
  lastUpdated.setHours(0, 0, 0, 0);

  // If the last updated date is not today, move the newRate to oldRates
  if (lastUpdated < today) {
    if (this.newRate) {
      this.oldRates.push({ rate: this.newRate, date: this.newRateDate });
    }
    this.newRateDate = today; // Set the new rate date to today
  }

  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Rate || mongoose.model("Rate", RateSchema);
