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
SaudaEntrySchema.index({ date: 1, company: 1 });

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
    let counter = await Counter.findOne({ _id: "saudaNumber" });

    if (!counter) {
      counter = await Counter.create({
        _id: "saudaNumber",
        seq: 6000,
      });
    } else if (counter.seq < 6000) {
      counter = await Counter.findByIdAndUpdate(
        { _id: "saudaNumber" },
        { $set: { seq: 6000 } },
        { new: true }
      );
    }

    const nextNumber = counter.seq;

    await Counter.findByIdAndUpdate(
      { _id: "saudaNumber" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    return nextNumber.toString();
  }

  const month = baseDate.getMonth() + 1;
  const year = baseDate.getFullYear();
  const seriesYear = month >= 4 ? year : year - 1;

  const counterId = `saudaNumber-${seriesYear}`;

  let counter = await Counter.findOne({ _id: counterId });

  if (!counter) {
    counter = await Counter.create({
      _id: counterId,
      seq: 1,
    });
  } else if (counter.seq < 1) {
    counter = await Counter.findByIdAndUpdate(
      { _id: counterId },
      { $set: { seq: 1 } },
      { new: true }
    );
  }

  const nextNumber = counter.seq;

  await Counter.findByIdAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true }
  );

  const padded = String(nextNumber).padStart(4, "0");

  return `${seriesYear}-${padded}`;
};

export default mongoose.models.SaudaEntry ||
  mongoose.model("SaudaEntry", SaudaEntrySchema);
