import {Link} from 'react-router-dom';

const WorkHoursPage = () => {
  return (
    <div className="container my-5">

      {/* Header */}
      <header className="d-flex justify-content-between align-items-center bg-primary text-white text-center py-2 px-4 mb-4 rounded">
        <h1>
          <i className="fa-solid fa-clock"></i> Work Hours
        </h1>
      </header>

      {/* Input Cards */}
      <div className="row g-3 mb-4">
        {/* Hours Input */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5>How many hours did you work today?</h5>
            <div className="d-flex mt-2">
              <input 
                type="number" 
                className="form-control me-2" 
                placeholder="Hours"
              />
              <button className="btn btn-success">Add</button>
            </div>
          </div>
        </div>

        {/* Rate Input */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5>How much do you earn per hour?</h5>
            <div className="d-flex mt-2">
              <input 
                type="number" 
                className="form-control me-2"
                placeholder="Rate per hour (€)"
              />
              <button className="btn btn-success">Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Display */}
      <div className="card p-4 bg-light text-center fs-4 fw-bold mb-4">
        Total Earnings: 0 €
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link 
          to='/'
          className="btn btn-outline-primary">Back to Money Map</Link>
      </div>

    </div>
  );
};

export default WorkHoursPage;
