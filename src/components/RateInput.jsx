import { useState } from "react"

const RateInput = ({rateInput, setRateInput}) => {
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleClick= (e) => {
        e.preventDefault()

        if (!rateInput) {
            alert('Please enter your hourly rate before proceeding.');
            return;
        };

        parseFloat(rateInput).toFixed(2);

        if (isNaN(rateInput) || rateInput<= 0) {
            alert("Your hourly rate must be a valid positive number.");
            return;
        };

        const confirmed = window.confirm
            (`You have set your hourly rate to €${rateInput}.\nDo you want to confirm this amount?`
        );

        if (confirmed) {
            alert("✅ Your hourly rate has been successfully saved!");
            setIsConfirmed(true);
        };

    };
            
  return (
    <div className="col-md-6">
        <div className="card shadow-sm border-0 rounded-3 p-4 text-center">
            <h6 className="mb-3 text-muted fw-bold">Hourly Rate (€)</h6>
            <div className="d-flex justify-content-center gap-2">

                {isConfirmed ? (
                    <>
                    <p className="fw-bold m-0">
                        Your wage is €{Number(rateInput).toFixed(2)}
                    </p>
                    <button
                        onClick={() => {
                            const confirmChange = window.confirm('Are you sure you want to change your hourly rate?');
                            if (confirmChange) {
                            setIsConfirmed(false);
                            }
                        }}
                        className="btn btn-warning fw-bold px-3 py-1"
                    >
                        Change
                    </button>
                    </>
                ) : (
                    <>
                        <input 
                            type="number" 
                            className="form-control text-center"
                            placeholder="€/hour"
                            value={rateInput}
                            onChange={(e)=> {
                                let val = e.target.value;
                                if (val.includes('.')) {
                                    const [intPart, decPart] = val.split('.');
                                    val = intPart + '.' + decPart.slice(0,2); // κρατάει μόνο 2 δεκαδικά
                                }
                                setRateInput(val);
                            }}
                            style={{ width: '120px', height: '38px' }}
                        />
                        <button
                            onClick={handleClick}  
                            className="btn btn-success fw-bold px-3 py-1"
                        >
                            <i className="fa-solid fa-plus"></i>Add
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
  )
}

export default RateInput