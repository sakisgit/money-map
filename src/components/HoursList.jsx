  import { useContext, useState } from "react";
  import { AppContext } from "../context/AppContext";

  const HoursList = () => {
    const {hoursList} = useContext(AppContext);
    return (
      <div className="card shadow-sm border-0 rounded-3 p-3 mt-4 text-center">
        <h6 className="mb-3 text-muted fw-bold">Worked Hours List</h6>
        
        <div 
          className="overflow-auto" 
          style={{ maxHeight: '400px' }}
        >

            <ul className="list-group list-group-flush">
        {hoursList.map((hoursItem, index) => (
              <li 
                key={hoursItem.id}
                className="list-group-item d-flex justify-content-between align-items-center p-2 border rounded-2 mb-1">
                 Day {hoursItem.date}
                <span className="fw-semibold">{hoursItem.hours} h</span>
              </li>
        ))}
            </ul>
      </div>
      </div>
    );
  };

  export default HoursList;
