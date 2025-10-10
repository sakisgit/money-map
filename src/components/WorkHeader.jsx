
  import TotalEarnings from "./TotalEarnings";

  const WorkHeader = ({ rateInput, totalHours }) => {
    const date = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    const fullDate = `${day}, ${date.toLocaleDateString()}`;


    return (
      <header className="d-flex justify-content-between align-items-center bg-primary text-white py-3 px-4 mb-4 rounded-4 shadow-lg">
        
        <h1 className="fs-3 fw-bold d-flex align-items-center m-0">
          <i className="fa-solid fa-clock me-2 fs-4">
          </i>
          Work Hours
        </h1>

        {/* Earnings + Date */}
        <div className="d-flex align-items-center gap-4">
          <div className="bg-light text-dark px-4 py-2 rounded-4 shadow-sm text-center">

            <TotalEarnings 
              rateInput={rateInput} 
              totalHours={totalHours} 
              minimal={true} 
            />
          </div>

          <span className="fs-6 fw-semibold text-light opacity-75">
            {fullDate}
          </span>
        </div>
      </header>
    );
  };

  export default WorkHeader;
