    import { useState } from "react";

    const HoursInput = ({hoursInput, setHoursInput}) => {

        const handleClick= (e) => {
            e.preventDefault();
            if(!hoursInput) {
                alert('Please enter the number of hours you worked today before continuing.');
                return;
            };

            parseFloat(hoursInput);

            if (isNaN(hoursInput) || hoursInput<= 0) {
                alert("Please provide a valid positive number for your worked hours.");
                return;
            };

            alert("Your worked hours have been successfully recorded.");
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
                    onChange={(e)=> {
                        let val = e.target.value;
                        if (val.includes('.')) {
                            const [intPart, decPart] = val.split('.');
                            val = intPart + '.' + decPart.slice(0,2); // κρατάει μόνο 2 δεκαδικά
                        }
                        setHoursInput(val);
                    }}
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