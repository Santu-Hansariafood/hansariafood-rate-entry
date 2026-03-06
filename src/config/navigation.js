export const ADMINS = (process.env.NEXT_PUBLIC_ADMIN_MOBILES || "").split(
  ","
);

export const NAV_CONFIG = [
  { label: "Rate", type: "dropdown", key: "rate", allowed: [] },
  // { label: "Landing Cost", path: "/landingcost", allowed: [] },
  { label: "Sauda", path: "/sauda", allowed: [] },
  { label: "Company", type: "dropdown", key: "company", allowed: [] },
  { label: "Register", path: "/register", allowed: [] },
  { label: "Commodity", path: "/commodity", allowed: [] },
  { label: "Category", path: "/category", allowed: [] },
];

export const RATE_DROPDOWN = [
  { label: "Rate", path: "/rate", allowed: [] },
  { label: "Landing Cost", path: "/landingcost", allowed: [] },
  { label: "Soya Rate", path: "/soyarate", allowed: [] },
  { label: "M DOC", path: "/mdocrate", allowed: [] },
  { label: "DDGS Rate", path: "/ddgsrate", allowed: [] },
  { label: "Freight", path: "/freight", allowed: [] },
];

export const COMPANY_DROPDOWN = [
  { label: "Company", path: "/company", allowed: [] },
  { label: "Manage Company", path: "/managecompany", allowed: [] },
  { label: "Seller Company", path: "/sellercompany", allowed: [] },
  { label: "Location", path: "/location", allowed: [] },
  { label: "Self Company", path: "/selfcompany", allowed: [] },
  { label: "Previous Sauda", path: "/previoussauda", allowed: [] },
  { label: "Buyer Company", path: "/buyercompany", allowed: [] },
  { label: "Seller", path: "/seller", allowed: [] },
  { label: "Soya", path: "/soya", allowed: [] },
  { label: "M DOC", path: "/mdoc", allowed: [] },
  { label: "DDGS", path: "/ddgs", allowed: [] },
];
