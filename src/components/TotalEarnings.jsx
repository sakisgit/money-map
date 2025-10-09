import { useState } from "react"

const TotalEarnings = ({rateInput, hoursInput}) => {
  const totalEarnings=(parseFloat(rateInput) || 0) * (parseFloat(hoursInput) || 0);

  return (
    <div className="card shadow-sm border-0 rounded-3 p-3 bg-light text-center fs-5 fw-semibold mb-4">
        <p>Total Earnings: €{totalEarnings.toFixed(2)}</p>
    </div>
  )
}

export default TotalEarnings