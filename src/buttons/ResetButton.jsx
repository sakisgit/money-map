
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

          // Καθαρίζουμε το context
          setLossItems([]);
          setIncomeItems([]);
          setPayment(0);
          setBalance(0);
          setTotalIncome(0);
          setTotalLoss(0);

          // Καθαρίζουμε και το localStorage
          localStorage.removeItem('payment');
          localStorage.removeItem('incomeItems');
          localStorage.removeItem('lossItems');
          localStorage.removeItem('hoursList');

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
        className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
        onClick={handleReset}
        style={{ whiteSpace: 'nowrap', minHeight: '38px', height: '38px', minWidth: 'fit-content', padding: '0.375rem 0.75rem' }}
    >
          <i className="fa-solid fa-rotate d-sm-none me-1"></i>
          <span className="d-none d-sm-inline">Reset Stats</span>
          <span className="d-sm-none">Reset</span>
    </button>
  )
};

export default ResetButton;