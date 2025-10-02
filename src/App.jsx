
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
      <Filter/>
      <Items 
        incomeItems={incomeItems}
        setIncomeItems={setIncomeItems}
        lossItems={lossItems}
        setLossItems={setLossItems}
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