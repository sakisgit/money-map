export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: "fa-coins" },
  { value: "card", label: "Card", icon: "fa-credit-card" },
];

export const getPaymentMethodLabel = (method) =>
  method === "card" ? "Card" : "Cash";

export const getPaymentMethodIcon = (method) => {
  const match = PAYMENT_METHODS.find((m) => m.value === method);
  return match?.icon ?? PAYMENT_METHODS[0].icon;
};
