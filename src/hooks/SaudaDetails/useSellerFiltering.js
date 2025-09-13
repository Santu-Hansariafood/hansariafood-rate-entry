import { useMemo } from "react";

export const useSellerFiltering = (sellerInfo) => {
  const sellerData = useMemo(() => {
    const SELLER_NAMES = sellerInfo?.sellers?.map(s => s.sellerName) || [];
    
    const sellerOk = (name) => {
      if (!SELLER_NAMES.length) return false;
      return SELLER_NAMES.some(sellerName => 
        String(name || "").toLowerCase().includes(sellerName.toLowerCase())
      );
    };

    const filterUnitsBySeller = (units) => {
      return units
        .map((u) => {
          const filteredCommodities = u.commodities
            .map((co) => {
              const saudas = co.saudas.filter((s) => sellerOk(s.sellerName));
              const totalTons = saudas.reduce((sum, s) => sum + (Number(s.tons) || 0), 0);
              return { ...co, saudas, totalTons };
            })
            .filter((co) => co.saudas.length > 0);
          const unitTotalTons = filteredCommodities.reduce((a, co) => a + (Number(co.totalTons) || 0), 0);
          return { ...u, commodities: filteredCommodities, unitTotalTons };
        })
        .filter((u) => u.commodities.length > 0);
    };

    return {
      SELLER_NAMES,
      sellerOk,
      filterUnitsBySeller,
      hasSellers: SELLER_NAMES.length > 0
    };
  }, [sellerInfo]);

  return sellerData;
};
