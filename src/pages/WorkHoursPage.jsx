

const WorkHoursPage = () => {
  return (
    <div className="container my-5">
      {/* Header */}
      <header className="d-sm-flex justify-content-between align-items-center bg-primary text-white text-center py-2 px-4 mb-4 rounded">
        <h1>
          <i className="fa-solid fa-clock"></i> Work Hours
        </h1>
      </header>

      {/* Card for Work Input */}
      <div className="card shadow-sm p-4 mb-4">
        <h5 className="mb-3">Πρόσθεσε πόσες μέρες δούλεψες σήμερα</h5>
        <div className="d-flex mb-3">
          <input 
            type="number" 
            className="form-control me-2" 
            placeholder="Π.χ. 1"
          />
          <button className="btn btn-success">Add Day</button>
        </div>
        <button className="btn btn-primary">Calculate Earnings</button>
      </div>

      {/* Earnings Display */}
      <div className="card p-3 bg-light">
        <h5 className="mb-2">Total Earnings</h5>
        <div className="fs-4 fw-bold">0 €</div>
      </div>
    </div>
  );
};

export default WorkHoursPage;
