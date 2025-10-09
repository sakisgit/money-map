
import TotalEarnings from "./TotalEarnings";

const WorkHeader = ({ rateInput, hoursInput }) => {
  return (
    <header className="d-flex justify-content-between align-items-center bg-primary text-white py-3 px-4 mb-4 rounded-3 shadow-sm">
      
      {/* Τίτλος */}
      <h1 className="fs-3 fw-bold m-0 d-flex align-items-center">
        <i className="fa-solid fa-clock me-2"></i>
        Work Hours
      </h1>

      {/* Earnings */}
      <div className="bg-light text-dark px-3 py-1 rounded shadow-sm d-flex flex-column align-items-center">
        <span className="fs-6 fw-semibold">Total Earnings</span>
        <TotalEarnings rateInput={rateInput} hoursInput={hoursInput} minimal={true} />
      </div>

    </header>
  )
}

export default WorkHeader;
