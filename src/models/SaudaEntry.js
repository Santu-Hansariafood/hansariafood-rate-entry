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
  { _id: false },
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
  },
);

SaudaEntrySchema.index({ date: 1 });
SaudaEntrySchema.index({ company: 1 });
SaudaEntrySchema.index({ date: 1, company: 1 }, { unique: true });
SaudaEntrySchema.index({ createdAt: 1 });

const CounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

SaudaEntrySchema.statics.getNextSaudaNumber = async function (dateStr) {
  let baseDate = null;

  if (typeof dateStr === "string") {
    const parts = dateStr.split("-");

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const [y, m, d] = parts.map(Number);
        baseDate = new Date(y, m - 1, d);
      }
      else {
        const [d, m, y] = parts.map(Number);
        baseDate = new Date(y, m - 1, d);
      }
    }
  }

  if (!baseDate || isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  const month = baseDate.getMonth() + 1;
  const year = baseDate.getFullYear();

  const financialYear = month >= 4 ? year : year - 1;

  const counterId = `saudaNumber-${financialYear}`;

  await Counter.updateOne(
    { _id: counterId },
    {
      $setOnInsert: {
        seq: 0,
      },
    },
    {
      upsert: true,
    },
  );

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    {
      $inc: {
        seq: 1,
      },
    },
    {
      new: true,
    },
  );

  return `${financialYear}-${String(counter.seq).padStart(4, "0")}`;
};

export default mongoose.models.SaudaEntry ||
  mongoose.model("SaudaEntry", SaudaEntrySchema);
