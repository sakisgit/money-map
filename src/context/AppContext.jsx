
import { useState, createContext } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    // HomePage States
    const [incomeItems, setIncomeItems] = useState([]);
    const [lossItems, setLossItems] = useState([]);
    const [payment, setPayment] = useState(0);
    const [filterLoss, setFilterLoss] = useState("");
    const [filterProfit, setFilterProfit] = useState("");
    const [balance, setBalance] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalLoss, setTotalLoss] = useState(0);

    // WorkHoursPage States
    const [rateInput, setRateInput]=useState('');
    const [hoursInput, setHoursInput] = useState('');
    const [totalHours, setTotalHours] = useState(0);

    const contextValue = {

        // HomePage to share
        incomeItems, setIncomeItems,
        lossItems, setLossItems,
        payment, setPayment,
        filterLoss, setFilterLoss,
        filterProfit, setFilterProfit,
        balance, setBalance,
        totalIncome, setTotalIncome,
        totalLoss, setTotalLoss,

        // WorkHoursPage to share 
        rateInput, setRateInput,
        hoursInput, setHoursInput,
        totalHours, setTotalHours


    };

    return (
        <AppContext.Provider 
            value={contextValue}
        >
            {children}
        </AppContext.Provider>
    );
};