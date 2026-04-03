
import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useFullDate } from "../hooks/useFullDate";
import Swal from "sweetalert2";
import { toLocalDateKey } from "../utils/dateKey";

const HoursInput = () => {
  const { 
    hoursInput, setHoursInput, 
    totalHours, setTotalHours,
    hoursList, setHoursList,
    rateInput
  } = useContext(AppContext);

  const fullDate = useFullDate();

  const handleClick = (e) => {
    e.preventDefault();

    if (!hoursInput) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Input',
        text: 'Please enter the number of hours you worked today before continuing.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const hoursValue = parseFloat(hoursInput);

    if (isNaN(hoursValue) || hoursValue <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Number',
        text: 'Please provide a valid positive number for your worked hours.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (isNaN(rateInput) || rateInput <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Hourly Rate Missing',
        text: "Oops! It looks like your hourly rate hasn't been set yet.",
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Hours Recorded!',
      text: `You have successfully recorded ${hoursValue} hours.`,
      confirmButtonText: 'OK'
    }).then(() => {
      const newTotalHours = totalHours + hoursValue;
      setTotalHours(newTotalHours);

      const newEntry = {
        id: Date.now(),
        fullDate: fullDate,
        dateKey: toLocalDateKey(),
        hours: hoursValue,
        rate: rateInput,
      };

      const newHoursList = [newEntry, ...hoursList];
      setHoursList(newHoursList);
      setTotalHours(newTotalHours);
      setHoursInput('');

      // AppContext also persists; this keeps storage in sync after add
      localStorage.setItem('hoursList', JSON.stringify(newHoursList));
      localStorage.setItem('totalHours', newTotalHours.toString());
    });
  };

  return (
    <div className="col-12 col-md-6">
      <div className="card shadow-sm border-0 rounded-3 p-3 p-md-4 text-center h-100">
        <h6 className="mb-3 text-muted fw-bold">Worked Hours</h6>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
          <input 
            type="number" 
            className="form-control text-center"
            placeholder="Hours"
            value={hoursInput}
            onChange={(e)=> {
              let val = e.target.value;
              if (val.includes('.')) {
                const [intPart, decPart] = val.split('.');
                val = intPart + '.' + decPart.slice(0,2); 
              }
              setHoursInput(val);
            }}
            style={{ 
              width: '100%', 
              maxWidth: '200px',
              height: '42px',
              margin: '0 auto'
            }}
          />
          <button
            type="submit"
            onClick={handleClick}
            className="btn btn-success fw-bold px-4 py-2"
            style={{ minWidth: '100px' }}
          >
            <i className="fa-solid fa-plus me-1"></i> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoursInput;
