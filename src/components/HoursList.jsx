
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

        // Καθαρίζουμε και το localStorage
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

    // Ενημέρωση localStorage
    localStorage.setItem('hoursList', JSON.stringify(newHoursList));
    localStorage.setItem('totalHours', totalHours - hoursItem.hours);
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
                  You worked for {hoursItem.hours} hours and earned {(hoursItem.rate * hoursItem.hours).toFixed(2)}€ at an hourly rate of {hoursItem.rate}€.
                </span>

                {/* Delete button */}
                <DeleteButton onDelete={() => handleDelete(hoursItem)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
};

export default HoursList;
