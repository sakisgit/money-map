
import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useFullDate } from "../hooks/useFullDate";
import Swal from "sweetalert2";

const HoursInput = () => {
  const { 
    hoursInput, setHoursInput, 
    totalHours, setTotalHours,
    hoursList, setHoursList,
    rateInput
  } = useContext(AppContext);

  const fullDate = useFullDate();

  useEffect(() => {
    const savedHoursList = localStorage.getItem('hoursList');
    const savedTotalHours = localStorage.getItem('totalHours');

    if (savedHoursList) setHoursList(JSON.parse(savedHoursList));
    if (savedTotalHours) setTotalHours(parseFloat(savedTotalHours));
  }, []);

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
        hours: hoursValue,
        rate: rateInput,
      };

      const newHoursList = [newEntry, ...hoursList];
      setHoursList(newHoursList);
      setHoursInput('');

      localStorage.setItem('hoursList', JSON.stringify(newHoursList));
      localStorage.setItem('totalHours', newTotalHours);
    });
  };

  return (
    <div className="col-12 col-md-6 mb-3">
      <div className="card shadow-sm border-0 rounded-3 p-4 text-center">
        <h6 className="mb-3 text-muted fw-bold">Worked Hours</h6>
        <div className="d-flex flex-wrap justify-content-center gap-2">
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
            style={{ width: '120px', height: '38px' }}
          />
          <button
            type="submit"
            onClick={handleClick}
            className="btn btn-success fw-bold px-3 py-1"
          >
            <i className="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoursInput;
