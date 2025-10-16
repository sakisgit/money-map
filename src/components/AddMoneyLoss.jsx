
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import { useGiphyGif } from "../hooks/useGiphyGif";
import { useFullDate } from "../hooks/useFullDate";

const AddMoneyLoss = () => {
  const { 
    lossItems, setLossItems, 
    filterLoss, payment, 
    moneyRemaining, formatMoney 
  } = useContext(AppContext);
  const fullDate=useFullDate();
  const [lossText, setLossText] = useState('');
  const [lossAmount, setLossAmount] = useState('');

  const { gifUrl, showGif } = useGiphyGif();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (payment === 0 || moneyRemaining === 0) {
      alert("Please set your monthly income before adding any expenses.");
      return;
    }

    if (!lossText || !lossAmount) {
      alert('Please complete all fields before adding an expense.');
      return;
    }

    const amountValue = parseFloat(lossAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('The expense amount must be greater than zero.');
      return;
    }

    if (/\d/.test(lossText)) {
      alert('The text must not contain numbers.');
      return;
    }

    const newItem = { 
      id: Date.now(),
      fullDate:fullDate,
      text: lossText, 
      amount: amountValue
    };

    setLossItems([...lossItems, newItem]);
    showGif(lossText || "loss", "loss");
    setLossText('');
    setLossAmount('');
  };

  const filteredItems = lossItems.filter(item =>
    item.text.toLowerCase().includes(filterLoss.toLowerCase())
  );

  return (
    <div className="mb-5">
      {/* Add Expense Form */}
      <div className="collapse" id="collapse-loss">
        <div className="card card-body bg-light">
          <form id="loss-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="loss-name" className="form-label">Expense Item</label>
              <input
                value={lossText}
                type="text"
                className="form-control"
                id="loss-name"
                placeholder="Enter Expense Item"
                onChange={(e) => setLossText(e.target.value.replace(/\d/g, ''))} 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loss-amount" className="form-label">Amount (€)</label>
              <input
                value={lossAmount}
                type="number"
                className="form-control"
                id="loss-amount"
                placeholder="Enter Amount (€)"
                onChange={(e) => setLossAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary text-white">Add Expense</button>
          </form>
        </div>
      </div>

      {/* Dynamic Expense List */}
      <div className="mt-3">
        {filterLoss && filteredItems.length === 0 ? (
          <p className="text-center text-muted fst-italic">❌ No matching expenses found.</p>
        ) : (
          filteredItems.map((item) => (
            <div className="card my-2 shadow-sm" key={item.id}>
              <div className="card-body d-flex align-items-center justify-content-between">
                
                {/* Container για text + amount + date + GIF */}
                <div className="d-flex align-items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  
                  {/* Expense text */}
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    fontWeight: 500
                  }}>
                    {item.text}
                  </span>

                  {/* Date badge */}
                  <span style={{
                    backgroundColor: '#e0e7ff',
                    color: '#1e40af',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.fullDate}
                  </span>

                  {/* Amount */}
                  <span className="fw-bold" style={{ whiteSpace: 'nowrap' }}>
                    {formatMoney(item.amount)} €
                  </span>

                  {/* GIF */}
                  {gifUrl && item.id === lossItems[lossItems.length - 1]?.id && (
                    <img
                      src={gifUrl}
                      alt="expense gif"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        padding: "5px",
                        backgroundColor: "#f0f0f0"
                      }}
                    />
                  )}
                </div>

                {/* Delete button */}
                <DeleteButton
                  onDelete={() => setLossItems(lossItems.filter(li => li.id !== item.id))}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddMoneyLoss;
