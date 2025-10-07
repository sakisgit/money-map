
import React, { useState } from "react";
import Header from "../components/Header";
import Stats from "../components/Stats";
import Filter from "../components/Filter";
import Items from "../components/Items";
import AddMoneyLoss from "../components/AddMoneyLoss";
import AddMoneyProfit from "../components/AddMoneyProfit";

const HomePage = () => {
  const [incomeItems, setIncomeItems] = useState([]);
  const [lossItems, setLossItems] = useState([]);
  const [payment, setPayment] = useState(0);
  const [filterLoss, setFilterLoss] = useState("");
  const [filterProfit, setFilterProfit] = useState("");
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);

  return (
    <>
      <Header
        payment={payment}
        setPayment={setPayment}
        setBalance={setBalance}
        setTotalIncome={setTotalIncome}
        setTotalLoss={setTotalLoss}
        setLossItems={setLossItems}
        setIncomeItems={setIncomeItems}
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
  );
};

export default HomePage;
