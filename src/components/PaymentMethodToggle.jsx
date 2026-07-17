const METHODS = [
  { value: "cash", label: "Cash", icon: "fa-coins" },
  { value: "card", label: "Card", icon: "fa-credit-card" },
];

const VARIANT_CONFIG = {
  expense: {
    fieldLabel: "Payment method",
    ariaLabel: "Payment method",
  },
  income: {
    fieldLabel: "How received",
    ariaLabel: "How received",
  },
};

const PaymentMethodToggle = ({
  value,
  onChange,
  idPrefix = "payment",
  variant = "expense",
}) => {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.expense;

  return (
    <div className="mb-3">
      <label className="form-label">{config.fieldLabel}</label>
      <div
        className="payment-method-toggle"
        role="group"
        aria-label={config.ariaLabel}
      >
        {METHODS.map((method) => {
          const inputId = `${idPrefix}-${method.value}`;
          const isActive = value === method.value;

          return (
            <label
              key={method.value}
              htmlFor={inputId}
              className={`payment-method-toggle__option${isActive ? " is-active" : ""}`}
            >
              <input
                type="radio"
                id={inputId}
                name={`${idPrefix}-method`}
                value={method.value}
                checked={isActive}
                onChange={() => onChange(method.value)}
                className="payment-method-toggle__input"
              />
              <i className={`fa-solid ${method.icon}`} aria-hidden></i>
              <span>{method.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export const getPaymentMethodLabel = (method) => {
  if (method === "card") return "Card";
  return "Cash";
};

export const getPaymentMethodIcon = (method) => {
  const match = METHODS.find((m) => m.value === method);
  return match?.icon ?? METHODS[0].icon;
};

export default PaymentMethodToggle;
