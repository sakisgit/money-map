import { useState } from "react";

const HoursInput = () => {
    const [hoursInput, setHoursInput]= useState('');

    const handleClick= (e) => {
        e.preventDefault();
        if(!hoursInput) {
            alert('You have to complete how many hours did you work today...');
            return;
        };
        setHoursInput('');
    };
  return (
    <div className="col-md-6">
        <div className="card shadow-sm border-0 rounded-3 p-4 text-center">
            <h6 className="mb-3 text-muted fw-bold">Worked Hours</h6>
            <div className="d-flex justify-content-center gap-2">
            <input 
                type="number" 
                className="form-control text-center"
                placeholder="Hours"
                value={hoursInput}
                onChange={(e)=> setHoursInput(e.target.value)}
                style={{ width: '120px', height: '38px' }}
            />
            <button
                onClick={handleClick}
                className="btn btn-success fw-bold px-3 py-1"
            >
                Add
            </button>
            </div>
        </div>
    </div>
  )
}

export default HoursInput