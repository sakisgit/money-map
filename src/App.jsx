
import Header from "./components/Header";
import Stats from "./components/Stats";
import Filter from './components/Filter';
import AddMoneyLoss from "./components/AddMoneyLoss";
import Items from "./components/Items";
import AddMoneyProfit from "./components/AddMoneyProfit";
import { useState } from "react";

const App = () => {
  const [incomeItems,setIncomeItems] = useState([]);
  const [lossItems, setLossItems] = useState([]);
  const [payment, setPayment] = useState(0);
  const [filterLoss, setFilterLoss] = useState('');
  const [filterProfit, setFilterProfit] = useState('');
   
  return (
    <>
      <Header 
        payment={payment} 
        setPayment={setPayment} 
      />
      <Stats 
        incomeItems={incomeItems}
        lossItems={lossItems}
        payment={payment}
      />
      <Filter
        filterLoss={filterLoss}
        setFilterLoss={setFilterLoss}
        filterProfit={filterProfit}
        setFilterProfit={setFilterProfit}
      />
      <Items 
        incomeItems={incomeItems}
        setIncomeItems={setIncomeItems}
        lossItems={lossItems}
        setLossItems={setLossItems}
        filterLoss={filterLoss}
        filterProfit={filterProfit}
      >
        <AddMoneyLoss 
          lossItems={lossItems}
          setLossItems={setLossItems}
        />
        <AddMoneyProfit
          incomeItems={incomeItems}
          setIncomeItems={setIncomeItems}
        />
      </Items>
    </>
  )
}

export default App