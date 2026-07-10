import DeleteButton from "../buttons/DeleteButton";
import { formatEntryDisplayDate } from "../utils/dateKey";
import { getPaymentMethodIcon, getPaymentMethodLabel } from "./PaymentMethodToggle";

const MoneyListItem = ({
  item,
  amountClass,
  formatMoney,
  onDelete,
}) => {
  const method = item.paymentMethod || "cash";

  return (
    <div className="card my-2 shadow-sm money-list-card">
      <div className="card-body p-3">
        <div className="money-list-item">
          <div className="money-list-item__leading">
            <span className="badge date-badge money-list-item__date">
              {formatEntryDisplayDate(item)}
            </span>

            <span className="fw-semibold money-list-item__name">
              {item.text}
            </span>
          </div>

          <div className="money-list-item__trailing">
            <span className={`fw-bold money-list-item__amount ${amountClass}`}>
              {formatMoney(item.amount)} €
            </span>

            <span
              className={`payment-method-icon payment-method-icon--${method}`}
              title={getPaymentMethodLabel(method)}
              aria-label={getPaymentMethodLabel(method)}
            >
              <i className={`fa-solid ${getPaymentMethodIcon(method)}`} aria-hidden></i>
            </span>

            <DeleteButton onDelete={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneyListItem;
