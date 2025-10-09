
const TotalEarnings = ({ rateInput, hoursInput, minimal }) => {
  const totalEarnings = (parseFloat(rateInput) || 0) * (parseFloat(hoursInput) || 0);

  return (
    <span className={minimal ? "fs-5 fw-bold" : "fs-5 fw-semibold"}>
      {minimal ? `€${totalEarnings.toFixed(2)}` : `Total Earnings: €${totalEarnings.toFixed(2)}`}
    </span>
  )
}

export default TotalEarnings;
