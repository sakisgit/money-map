
import { useContext,useState } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const RateInput = () => {
    const {rateInput, setRateInput} = useContext(AppContext);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleClick= async (e) => {
        e.preventDefault()

        if (!rateInput) {
            Swal.fire({
            icon: 'warning',
            title: 'Missing Rate',
            text: 'Please enter your hourly rate before proceeding.',
            confirmButtonText: 'OK'
            });
            return;
        }

        const rateValue = parseFloat(rateInput).toFixed(2);
        if (isNaN(rateValue) || rateValue <= 0) {
            Swal.fire({
            icon: 'error',
            title: 'Invalid Rate',
            text: 'Your hourly rate must be a valid positive number.',
            confirmButtonText: 'OK'
            });
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: `Confirm Hourly Rate`,
            text: `You have set your hourly rate to €${rateValue}. Do you want to confirm?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, confirm',
            cancelButtonText: 'Cancel'
        });

        if (isConfirmed) {
            setIsConfirmed(true);
            Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: `Your hourly rate has been successfully saved!`,
            timer: 1500,
            showConfirmButton: false
            });
        }
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
                        onClick={async () => {
                            const { isConfirmed } = await Swal.fire({
                            title: 'Change Hourly Rate?',
                            text: 'Are you sure you want to change your hourly rate?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, change',
                            cancelButtonText: 'Cancel'
                            });

                            if (isConfirmed) {
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