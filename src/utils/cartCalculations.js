// Cart calculation constants and utilities
export const MINIMUM_ORDER = 1000;
export const DELIVERY_CHARGE = 180;
export const COD_FEE = 10;

export const calculateCartTotals = (cartTotal) => {
  const courierCharge = cartTotal >= MINIMUM_ORDER ? 0 : DELIVERY_CHARGE;
  
  return {
    courierCharge,
    codFee: COD_FEE,
    total: cartTotal + courierCharge + COD_FEE
  };
};