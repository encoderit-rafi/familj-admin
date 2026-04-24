import { useState, useEffect } from "react";

export const useSalesStageFromLocalStorage = () => {
  const [salesStage, setSalesStage] = useState(null);

  useEffect(() => {
    const storedSalesStage = localStorage.getItem("saleStages");
    if (storedSalesStage) {
      setSalesStage(JSON.parse(storedSalesStage));
    }
  }, []);

  return salesStage;
};
