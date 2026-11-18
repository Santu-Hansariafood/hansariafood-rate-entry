export const FREIGHT_COMMODITIES = [
  "Maize DDGS",
  "M DOC",
  "Soya",
  "Maize Ddgs Doc",
];

export const normalizeFreightValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const matchesFreightCommodity = (companyCommodities, selected) => {
  if (!Array.isArray(companyCommodities) || !selected) return false;

  const selectedLower = selected.toLowerCase();
  if (selectedLower === "soya") {
    return companyCommodities.some((commodity) => {
      const value = commodity.toLowerCase();
      return value.includes("soya") || value.includes("sbm");
    });
  }

  if (selectedLower.includes("ddgs")) {
    return companyCommodities.some((commodity) =>
      commodity.toLowerCase().includes("ddgs")
    );
  }

  if (selectedLower === "m doc") {
    return companyCommodities.some((commodity) => {
      const value = commodity.toLowerCase();
      return value.includes("mdoc") || value.includes("m doc");
    });
  }

  return companyCommodities.some(
    (commodity) => commodity.toLowerCase() === selectedLower
  );
};

const getReferenceId = (value) => String(value?._id ?? value ?? "");

export const freightRouteKey = ({
  commodity,
  company,
  location,
  deliveryCompany,
  deliveryLocation,
}) =>
  [
    normalizeFreightValue(commodity),
    getReferenceId(company),
    normalizeFreightValue(location),
    getReferenceId(deliveryCompany),
    normalizeFreightValue(deliveryLocation),
  ].join("|");
