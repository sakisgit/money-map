
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const TotalEarnings = ({ minimal = true, entries = null }) => {
  const { workHoursTotalEarnings, formatMoney } = useContext(AppContext);

  const total = entries
    ? entries.reduce(
        (sum, item) =>
          sum + (Number(item?.hours) || 0) * (Number(item?.rate) || 0),
        0
      )
    : workHoursTotalEarnings;

  return (
    <>
      <span className="fs-6 fw-semibold d-block text-secondary mb-1">
        Total Earnings:
      </span>
      <span className={minimal ? "fs-5 fw-bold " : "fs-5 fw-semibold"}>
        {minimal
          ? `€${formatMoney(total)}`
          : `Total Earnings: €${formatMoney(total)}`}
      </span>
    </>
  );
};

export default TotalEarnings;
