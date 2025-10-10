
const HoursList = () => {
  return (
    <div className="card shadow-sm border-0 rounded-3 p-3 mt-4">
      <h6 className="mb-3 text-muted fw-bold">Worked Hours List</h6>
      
      <div 
        className="overflow-auto" 
        style={{ maxHeight: '400px' }}
      >
        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between align-items-center p-2 border rounded-2 mb-1">
            Example Day
            <span className="fw-semibold">2 h</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center p-2 border rounded-2 mb-1">
            Example Day
            <span className="fw-semibold">3.5 h</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center p-2 border rounded-2 mb-1">
            Example Day
            <span className="fw-semibold">1 h</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center p-2 border rounded-2 mb-1">
            Example Day
            <span className="fw-semibold">4 h</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HoursList;
