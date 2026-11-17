const GST_APPLICABLE_COMMODITIES = new Set([
  "mix ddgs",
  "ddgs",
  "m doc",
  "rice ddgs",
  "sbm 46%",
  "sbm 47%",
  "sbm 48%",
  "sbm 50%",
  "sbm 51%",
]);

export const calculateLandingCost = (baseRate, freight, commodity) => {
  const subtotal = baseRate + freight;
  const gst = GST_APPLICABLE_COMMODITIES.has(
    String(commodity || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
  )
    ? Number((subtotal * 0.05).toFixed(2))
    : 0;

  return { gst, landed: Number((subtotal + gst).toFixed(2)) };
};
