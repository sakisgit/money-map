
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const RateInput = () => {
  const { rateInput, setRateInput } = useContext(AppContext);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const savedRate = localStorage.getItem("hourlyRate");
    if (savedRate) {
      setRateInput(savedRate);
      setIsConfirmed(true);
    }
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();

    if (!rateInput) {
      Swal.fire({
        icon: "warning",
        title: "Missing Rate",
        text: "Please enter your hourly rate before proceeding.",
        confirmButtonText: "OK",
      });
      return;
    }

    const rateValue = parseFloat(rateInput).toFixed(2);
    if (isNaN(rateValue) || rateValue <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Rate",
        text: "Your hourly rate must be a valid positive number.",
        confirmButtonText: "OK",
      });
      return;
    }

    const { isConfirmed: confirm } = await Swal.fire({
      title: `Confirm Hourly Rate`,
      text: `You have set your hourly rate to €${rateValue}. Do you want to confirm?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, confirm",
      cancelButtonText: "Cancel",
    });

    if (confirm) {
      setIsConfirmed(true);
      localStorage.setItem("hourlyRate", rateValue);
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `Your hourly rate has been successfully saved!`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleChangeRate = async () => {
    const { isConfirmed: confirm } = await Swal.fire({
      title: "Change Hourly Rate?",
      text: "Are you sure you want to change your hourly rate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change",
      cancelButtonText: "Cancel",
    });

    if (confirm) {
      setIsConfirmed(false);
      localStorage.removeItem("hourlyRate");
    }
  };

  return (
    <div className="col-md-6">
      <div className="card shadow-sm border-0 rounded-3 p-4 text-center">
        <h6 className="mb-3 text-muted fw-bold">Hourly Rate (€)</h6>

        <div
          className="d-flex flex-wrap justify-content-center align-items-center gap-2"
          style={{ rowGap: "10px" }}
        >
          {isConfirmed ? (
            <>
              <p className="fw-bold m-0 fs-6">
                Your wage:{" "}
                <span className="text-success">
                  €{Number(rateInput).toFixed(2)}
                </span>
              </p>
              <button
                onClick={handleChangeRate}
                className="btn btn-warning fw-bold px-3 py-1"
                style={{ minWidth: "100px" }}
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
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes(".")) {
                    const [intPart, decPart] = val.split(".");
                    val = intPart + "." + decPart.slice(0, 2);
                  }
                  setRateInput(val);
                }}
                style={{
                  width: "130px",
                  height: "40px",
                  fontSize: "0.95rem",
                }}
              />
              <button
                onClick={handleClick}
                className="btn btn-success fw-bold px-3 py-1"
                style={{ minWidth: "100px" }}
              >
                <i className="fa-solid fa-plus me-1"></i>Add
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateInput;
