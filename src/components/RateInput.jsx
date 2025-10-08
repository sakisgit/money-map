import { useState } from "react"

const RateInput = () => {
    const [rateInput, setRateInput]=useState('');

    const handleClick= (e) => {
         e.preventDefault();
        if (!rateInput) {
        alert('You have to write the exact payment per hour!');
        return;
        }

        const confirmed = window.confirm(`Your rate is set to ${rateInput} € per hour`);

        if (confirmed) {
        // later you can lift this value up to parent
        alert("Rate saved successfully!");
        };
    };
            
  return (
    <div className="col-md-6">
        <div className="card shadow-sm border-0 rounded-3 p-4 text-center">
            <h6 className="mb-3 text-muted fw-bold">Hourly Rate (€)</h6>
            <div className="d-flex justify-content-center gap-2">
                <input 
                    type="number" 
                    className="form-control text-center"
                    placeholder="€/hour"
                    value={rateInput}
                    onChange={(e)=> setRateInput(e.target.value)}
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

export default RateInput