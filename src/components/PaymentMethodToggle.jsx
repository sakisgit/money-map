const METHODS = [
  { value: "cash", label: "Μετρητά", icon: "fa-money-bill-wave" },
  { value: "card", label: "Κάρτα", icon: "fa-credit-card" },
];

const PaymentMethodToggle = ({ value, onChange, idPrefix = "payment" }) => (
  <div className="mb-3">
    <label className="form-label">Τρόπος πληρωμής</label>
    <div className="payment-method-toggle" role="group" aria-label="Τρόπος πληρωμής">
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

export const getPaymentMethodLabel = (method) => {
  if (method === "card") return "Κάρτα";
  return "Μετρητά";
};

export const getPaymentMethodIcon = (method) => {
  const match = METHODS.find((m) => m.value === method);
  return match?.icon ?? METHODS[0].icon;
};

export default PaymentMethodToggle;
