import { PAYMENT_METHODS } from "../utils/paymentMethod";

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
        {PAYMENT_METHODS.map((method) => {
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



export default PaymentMethodToggle;
