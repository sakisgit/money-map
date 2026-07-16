
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import PageActions from "../components/PageActions";
import Stats from "../components/Stats";
import Filter from "../components/Filter";
import Items from "../components/Items";
import WorkCalendar from "../components/WorkCalendar";
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
          <img src={loaderGif} alt="Loading..." className="page-loader" />
        </div>
      ) : (
        <>
          <div className="container page-content my-4">
            <PageActions />
            <WorkCalendar />
            <Stats/>
            <Filter/>
            <Items />
          </div>
        </>
      )}
    </>
  );
};

export default HomePage;
