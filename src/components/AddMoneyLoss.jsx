
import { useState } from "react";

const AddMoneyLoss = () =>  {
  const [lossItem, setLossItem] = useState([]);
  const  [lossText, setLossText] = useState('');
  const [lossAmount,setLossAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      text: lossText,
      amount: parseFloat(lossAmount),
    };
    if(!lossText || !lossAmount ) {
      alert('You have to complete the fields first...');
      return;
    };
    setLossItem([...lossItem,newItem]);
    setLossAmount('');
    setLossText('');
    };

  return (
    <div className="mb-5">
      {/* Add Expense Form */}
      <div className="collapse" id="collapse-loss">
        <div className="card card-body bg-light">
          <form  
            id="loss-form"
            onSubmit={handleSubmit}  
          >
            <div className="mb-3">
              <label htmlFor="loss-name" className="form-label">
                Expense Item
              </label>
              <input
                value={lossText}
                type="text"
                className="form-control"
                id="loss-name"
                placeholder="Enter Expense Item"
                onChange={(e) => setLossText(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loss-amount" className="form-label">
                Amount (€)
              </label>
              <input
                value={lossAmount}
                type="number"
                className="form-control"
                id="loss-amount"
                placeholder="Enter Amount (€)"
                onChange={(e) => setLossAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary text-white">
              Add Expense
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Expense List */}
      <div className="mt-3">
        {lossItem.map((item, index) => (
          <div className="card my-2" key={index}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <span>{item.text}</span>
              <span className="fw-bold">{item.amount}€</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fake Items / Expense List */}
      <div className="mt-3">
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Rent</span>
            <span className="fw-bold">500€</span>
          </div>
        </div>
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Groceries</span>
            <span className="fw-bold">150€</span>
          </div>
        </div>
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Utilities</span>
            <span className="fw-bold">100€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyLoss;
