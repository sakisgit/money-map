
import { useState } from "react";
import DeleteButton from "../buttons/DeleteButton";

const AddMoneyLoss = ({lossItems, setLossItems , filterLoss}) =>  {
  const  [lossText, setLossText] = useState('');
  const [lossAmount,setLossAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!lossText || !lossAmount ) {
      alert('Please complete all fields before adding an expense.');
      return;
    } else if (lossAmount<=0) {
      alert('The expense amount must be greater than zero.');
      return;
    };
    const newItem = {
      text: lossText,
      amount: parseFloat(lossAmount),
    };
    setLossItems([...lossItems,newItem]);
    setLossAmount('');
    setLossText('');
    };

  const filteredItems = lossItems.filter(item =>
    item.text.toLowerCase().includes(filterLoss.toLowerCase())
  );


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
        {filteredItems.map((item, index) => (
          <div className="card my-2" key={index}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <span>{item.text}</span>
              <span className="fw-bold">{item.amount} €</span>
              <DeleteButton/>
            </div>
          </div>
        ))}
      </div>

      {/* Fake Items / Expense List */}
      
    </div>
  );
};

export default AddMoneyLoss;