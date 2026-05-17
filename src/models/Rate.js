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
RateSchema.index({ createdAt: 1 });

RateSchema.pre("save", async function () {
  try {
    const now = new Date();
    
    // Set updateTime only if it's not already set or if newRate is being modified
    const isMod = typeof this.isModified === 'function' && this.isModified("newRate");
    const shouldUpdate = !this.updateTime || isMod;
    
    if (shouldUpdate) {
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      const mStr = minutes < 10 ? '0' + minutes : minutes;
      this.updateTime = `${h12}:${mStr} ${ampm}`;
    }

    this.updatedAt = now;
  } catch (err) {
    console.error("Error in Rate model pre-save hook:", err);
    throw err;
  }
});

export default mongoose.models.Rate || mongoose.model("Rate", RateSchema);
