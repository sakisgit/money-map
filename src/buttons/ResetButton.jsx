
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const ResetButton = () => {
    const {
      setLossItems, setIncomeItems, 
      setPayment, setBalance, 
      setTotalIncome, setTotalLoss 
    } = useContext(AppContext);
    
    const handleReset= () =>{
      Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to reset all stats?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reset it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          setLossItems([]);
          setIncomeItems([]);
          setPayment(0);
          setBalance(0);
          setTotalIncome(0);
          setTotalLoss(0);

          Swal.fire({
            title: 'Reset!',
            text: 'All stats have been reset.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        };
      });
};
  return (
    
    <button 
        id="reset" 
        className="btn btn-outline-light me-2"
        onClick={handleReset}
    >
          Reset Stats
    </button>
  )
};

export default ResetButton;