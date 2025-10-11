
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useState } from "react"; 
import DeleteButton from "../buttons/DeleteButton";

const AddMoneyProfit = () => {
  const {incomeItems, setIncomeItems, filterProfit } = useContext(AppContext);
  const [incomeText, setIncomeText] = useState ('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const handleSubmit= (e) => {
    e.preventDefault();
    if(!incomeAmount || !incomeText) {
      alert('Please complete all fields before adding an income.');
      return; 
    } else if(incomeAmount<=0){
      alert('The income amount must be greater than zero.');
    };
    
    const newItem = {
      text: incomeText, 
      amount: parseFloat(incomeAmount),
    };
    setIncomeItems([...incomeItems, newItem]);
    setIncomeText('');
    setIncomeAmount('');
  };

  const filteredItems = incomeItems.filter(item =>
    item.text.toLowerCase().includes(filterProfit.toLowerCase())
  );

  return (
    <div className="mb-5">
      {/* Add Income Form */}
      <div 
        className="collapse " 
        id="collapse-profit"
      >
        <div className="card card-body bg-light">
          <form 
            id="profit-form" 
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <label 
                htmlFor="profit-name" 
                className="form-label"
              >
                Income Source
              </label>
              <input
                type="text"
                className="form-control"
                id="profit-name"
                placeholder="Enter Income Source"
                value={incomeText}
                onChange={(e)=> setIncomeText(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="profit-amount" className="form-label">
                Amount (€)
              </label>
              <input
                type="number"
                className="form-control"
                id="profit-amount"
                placeholder="Enter Amount (€)"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary text-white">
              Add Income
            </button>
          </form>
        </div>
      </div>
      
      {/* Dynamic Expense List */}
      <div className="mt-3">
        {filterProfit && filteredItems.length === 0 ? (
          <p className="text-center text-muted fst-italic">❌ No matching income found.</p>
        ) : (
          filteredItems.map((item, index) => (
            <div className="card my-2" key={index}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <span>{item.text}</span>
                <span className="fw-bold">{item.amount} €</span>
                <DeleteButton onDelete={() => {
                  const updatedItems = incomeItems.filter((_, i) => i !== index);
                  setIncomeItems(updatedItems);
                }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fake Items / Income List */}
    </div>
  );
};

export default AddMoneyProfit;
