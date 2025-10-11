
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const TotalEarnings = ({ minimal = true }) => {
  const { rateInput, totalHours} = useContext(AppContext);
  const totalEarnings = (parseFloat(rateInput) || 0) * (parseFloat(totalHours) || 0);

  return (
    <>
      <span className="fs-6 fw-semibold d-block text-secondary mb-1">
        Total Earnings:
      </span>
      <span className={minimal ? "fs-5 fw-bold" : "fs-5 fw-semibold"}>
        {minimal ? `€${totalEarnings.toFixed(2)}` : `Total Earnings: €${totalEarnings.toFixed(2)}`}
      </span>
    </>
  )
}

export default TotalEarnings;
