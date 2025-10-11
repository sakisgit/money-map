
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const ResetButton = () => {
    const {
      setLossItems, setIncomeItems, 
      setPayment, setBalance, 
      setTotalIncome, setTotalLoss 
    } = useContext(AppContext);
    
    const handleReset= () =>{
        if(window.confirm('Do you really want to reset the stats??')){
            setLossItems([]);
            setIncomeItems([]);
            setPayment(0);
            setBalance(0);
            setTotalIncome(0);
            setTotalLoss(0);
        };
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
}

export default ResetButton