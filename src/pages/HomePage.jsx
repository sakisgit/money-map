
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";
import Stats from "../components/Stats";
import Filter from "../components/Filter";
import Items from "../components/Items";
import AddMoneyLoss from "../components/AddMoneyLoss";
import AddMoneyProfit from "../components/AddMoneyProfit";
import loaderGif from '../assets/spinner.gif'

const HomePage = () => {
  const {
    incomeItems, setIncomeItems,
    lossItems, setLossItems,
    payment, setPayment,
    filterLoss, setFilterLoss,
    filterProfit, setFilterProfit,
    balance, setBalance,
    totalIncome, setTotalIncome,
    totalLoss, setTotalLoss
  } = useContext(AppContext);
 
  const [loading, setLoading] = useState(false);
  

  return (
    <>
      {loading ? (
        <div className="text-center my-5">
          <img src={loaderGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
        </div>
      ) : (
        <>
          <Header/>

          <Stats/>

          <Filter/>

          <Items>

            <AddMoneyLoss/>

            <AddMoneyProfit/>

          </Items>
        </>
      )}
    </>
  );
};

export default HomePage;
