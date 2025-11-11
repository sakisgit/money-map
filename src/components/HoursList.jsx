
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import Swal from "sweetalert2";

const HoursList = () => {
  const { 
    hoursList, setHoursList,
    setTotalHours, totalHours
  } = useContext(AppContext);

  const handleClear = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to clear all worked hours?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setHoursList([]);
        setTotalHours(0);
        localStorage.removeItem('hoursList');
        localStorage.removeItem('totalHours');
        Swal.fire({
          icon: 'success',
          title: 'Cleared!',
          text: 'All worked hours have been removed.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleDelete = (hoursItem) => {
    const newHoursList = hoursList.filter(li => li.id !== hoursItem.id);
    setHoursList(newHoursList);
    setTotalHours(prev => prev - hoursItem.hours);

    localStorage.setItem('hoursList', JSON.stringify(newHoursList));
    localStorage.setItem('totalHours', totalHours - hoursItem.hours);
  };

  return (
    hoursList.length > 0 && (
      <div className="card shadow-sm border-0 rounded-3 p-3 mt-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
          <h6 className="text-muted fw-bold m-0">Worked Hours List</h6>
          <button
            onClick={handleClear}
            className="btn btn-primary btn-sm text-white fw-bold py-2 px-3"
          >
            <i className="fa-solid fa-trash me-1"></i>
            Clear All
          </button>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
          <ul className="list-group list-group-flush">
            {hoursList.map((hoursItem) => (
              <li
                key={hoursItem.id}
                className="list-group-item p-3 border rounded-2 mb-2"
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                  {/* Left: Date + Info */}
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                    <span className="badge date-badge">
                      {hoursItem.fullDate}
                    </span>
                    
                    <span className="fw-semibold" style={{ fontSize: '0.95rem' }}>
                      Worked {hoursItem.hours}h → <span className="text-success fw-bold">{(hoursItem.rate * hoursItem.hours).toFixed(2)}€</span>
                    </span>
                  </div>

                  {/* Right: Delete button */}
                  <DeleteButton onDelete={() => handleDelete(hoursItem)} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
};

export default HoursList;
