
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";

const HoursList = () => {
  const { hoursList, setHoursList,setTotalHours } = useContext(AppContext);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all worked hours?")) {
      setHoursList([]);
      setTotalHours(0);
    }
  };

  return (
    hoursList.length>0 && (
    <div className="card shadow-sm border-0 rounded-3 p-3 mt-4 text-center">
      <div className="d-flex align-items-center mb-3">
        <h6 className="text-muted fw-bold m-0">Worked Hours List</h6>
        <button
          onClick={handleClear}
          className="btn btn-primary btn-sm ms-auto text-white fw-bold py-1 px-2"
        >
          Clear All List
        </button>
      </div>

      <div className="overflow-auto" style={{ maxHeight: '400px' }}>
        <ul className="list-group list-group-flush">
          {hoursList.map((hoursItem) => (
            <li
              key={hoursItem.id}
              className="list-group-item d-flex justify-content-between align-items-center p-2 border rounded-2 mb-1"
            >
              <span style={{
                backgroundColor: '#e0e7ff',
                color: '#1e40af',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                {hoursItem.fullDate}
              </span>

              <span className="fw-semibold">
                {hoursItem.hours} h
              </span>

              {/* Delete button */}
            <DeleteButton
                onDelete={() => {
                  setHoursList(hoursList.filter(li => li.id !==hoursItem.id))
                  setTotalHours(prev => prev - hoursItem.hours);
                }}
            />
            </li>
            
          ))}
        </ul>
      </div>
    </div>
    )
  );
};

export default HoursList;
