import PaymentDropdown from "../buttons/PaymentDropdown";
import ResetButton from "../buttons/ResetButton";

/** Payment and reset toolbar for Home / Stats pages. */
const PageActions = () => {
  return (
    <div className="page-actions" role="group" aria-label="Payment and reset">
      <PaymentDropdown variant="page" />
      <ResetButton variant="page" />
    </div>
  );
};

export default PageActions;
