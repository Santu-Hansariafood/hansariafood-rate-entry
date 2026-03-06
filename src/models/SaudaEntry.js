import mongoose from "mongoose";

const saudaEntrySubSchema = new mongoose.Schema(
  {
    tons: { type: Number, required: true },
    others: { type: String, default: "" },
    saudaNo: { type: String, default: "" },
    finalRate: { type: Number, default: 0 },
    unit: { type: String, required: true },
    commodity: { type: String, required: true },
    sellerName: { type: String, default: "" },
    sellerCompany: { type: String, default: "" },
    deliveryDate: { type: String, default: "" },
  },
  { _id: false }
);

const SaudaEntrySchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    buyer: { type: String },
    seller: { type: String },
    date: { type: String, required: true },
    time: { type: String },
    mobile: { type: String },
    saudaEntries: {
      type: Map,
      of: [saudaEntrySubSchema],
    },
    lastUpdated: { type: Date },
  },
  {
    timestamps: true,
  }
);

SaudaEntrySchema.index({ date: 1 });
SaudaEntrySchema.index({ company: 1 });
SaudaEntrySchema.index({ date: 1, company: 1 }, { unique: true });

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 6000 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

SaudaEntrySchema.statics.getNextSaudaNumber = async function (dateStr) {
  let baseDate;

  if (typeof dateStr === "string") {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const [y, m, d] = parts.map((v) => parseInt(v, 10));
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
          baseDate = new Date(y, m - 1, d);
        }
      } else {
        const [d, m, y] = parts.map((v) => parseInt(v, 10));
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
          baseDate = new Date(y, m - 1, d);
        }
      }
    }
  }

  if (!baseDate || Number.isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  const transitionStart = new Date(2026, 3, 1);

  if (baseDate < transitionStart) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "saudaNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If it was just created or seq was low, ensure it's at least 6000
    if (counter.seq <= 6000) {
      const fixedCounter = await Counter.findByIdAndUpdate(
        { _id: "saudaNumber" },
        { $set: { seq: 6001 } },
        { new: true }
      );
      return "6000";
    }

    return (counter.seq - 1).toString();
  }

  const month = baseDate.getMonth() + 1;
  const year = baseDate.getFullYear();
  const seriesYear = month >= 4 ? year : year - 1;

  const counterId = `saudaNumber-${seriesYear}`;

  const counter = await Counter.findByIdAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // If it was just created or seq was 0, it should start from 1
  // setDefaultsOnInsert sets seq to 6000 by default from CounterSchema, 
  // but for yearly series we want it to start from 1.
  // Let's adjust CounterSchema or handle it here.
  // Actually, let's just handle it here for simplicity.
  
  let currentSeq = counter.seq;
  if (counterId.includes("-") && currentSeq > 5000) {
     // This was likely an upsert that used the 6000 default. Reset to 1.
     const resetCounter = await Counter.findByIdAndUpdate(
        { _id: counterId },
        { $set: { seq: 2 } },
        { new: true }
     );
     currentSeq = 1;
  } else {
     currentSeq = currentSeq - 1;
  }

  const padded = String(currentSeq).padStart(4, "0");
  return `${seriesYear}-${padded}`;
};

export default mongoose.models.SaudaEntry ||
  mongoose.model("SaudaEntry", SaudaEntrySchema);
