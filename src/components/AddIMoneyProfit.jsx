
import { useState } from "react"; 

const AddMoneyProfit = () => {
  const [incomeItems, setIncomeItems]= useState([]);
  const [incomeText, setIncomeText] = useState ('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const handleSubmit= (e) => {
    e.preventDefault();
    if(!incomeAmount || !incomeText) {
      alert('You have to complete the field...');
      return; 
    }

    const newItem = {
      text: incomeText,
      amount: parseFloat(incomeAmount),
    };
    setIncomeItems([...incomeItems, newItem]);
    setIncomeText('');
    setIncomeAmount('');
  };

  return (
    <div className="mb-5">
      {/* Add Income Form */}
      <div className="collapse " id="collapse-profit">
        <div className="card card-body bg-light">
          <form 
            id="profit-form" 
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <label htmlFor="profit-name" className="form-label">
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
        {incomeItems.map((item, index) => (
          <div className="card my-2" key={index}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <span>{item.text}</span>
              <span className="fw-bold">{item.amount}€</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fake Items / Income List */}
      <div className="mt-3">
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Salary</span>
            <span className="fw-bold">1500€</span>
          </div>
        </div>
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Freelance</span>
            <span className="fw-bold">400€</span>
          </div>
        </div>
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Investment</span>
            <span className="fw-bold">200€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyProfit;
