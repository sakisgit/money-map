
import Header from "./components/Header";
import Stats from "./components/Stats";
import Filter from './components/Filter';
import AddMoneyLoss from "./components/AddMoneyLoss";
import Items from "./components/Items";
import AddMoneyProfit from "./components/AddIMoneyProfit";

const App = () => {
  return (
    <>
      <Header/>
      <Stats/>
      <Filter/>
      <Items>
        <AddMoneyLoss/>
        <AddMoneyProfit/>
      </Items>
    </>
  )
}

export default App