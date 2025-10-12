
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import { useGiphyGif } from "../hooks/useGiphyGif";

const AddMoneyProfit = () => {
  const { incomeItems, setIncomeItems, filterProfit } = useContext(AppContext);
  const [incomeText, setIncomeText] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const { gifUrl, showGif } = useGiphyGif();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!incomeText || !incomeAmount) {
      alert('Please complete all fields before adding an income.');
      return; 
    } else if (incomeAmount <= 0) {
      alert('The income amount must be greater than zero.');
      return;
    }  else if (/\d/.test(incomeText)) { 
      alert('The text must not contain numbers.');
      return;
    }

    const newItem = { text: incomeText, amount: parseFloat(incomeAmount) };
    setIncomeItems([...incomeItems, newItem]);

    showGif(incomeText || "profit", "profit");

    setIncomeText('');
    setIncomeAmount('');
  };

  const filteredItems = incomeItems.filter(item =>
    item.text.toLowerCase().includes(filterProfit.toLowerCase())
  );

  return (
    <div className="mb-5">
      {/* Add Income Form */}
      <div className="collapse" id="collapse-profit">
        <div className="card card-body bg-light">
          <form id="profit-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="profit-name" className="form-label">Income Source</label>
              <input
                value={incomeText}
                type="text"
                className="form-control"
                id="profit-name"
                placeholder="Enter Income Source"
                onChange={(e) => setIncomeText(e.target.value.replace(/\d/g, ''))} // αφαιρεί αριθμούς
              />
            </div>
            <div className="mb-3">
              <label htmlFor="profit-amount" className="form-label">Amount (€)</label>
              <input
                value={incomeAmount}
                type="number"
                className="form-control"
                id="profit-amount"
                placeholder="Enter Amount (€)"
                onChange={(e) => setIncomeAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary text-white">Add Income</button>
          </form>
        </div>
      </div>

      {/* Dynamic Income List */}
      <div className="mt-3">
        {filterProfit && filteredItems.length === 0 ? (
          <p className="text-center text-muted fst-italic">❌ No matching income found.</p>
        ) : (
          filteredItems.map((item, index) => (
            <div className="card my-2" key={index}>
              <div className="card-body d-flex align-items-center justify-content-between">

                {/* Container για text + amount + GIF */}
                <div className="d-flex align-items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {item.text}
                  </span>

                  <span className="fw-bold" style={{ whiteSpace: 'nowrap' }}>
                    {item.amount} €
                  </span>

                  {gifUrl && index === incomeItems.length - 1 && (
                    <img
                      src={gifUrl}
                      alt="income gif"
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

                {/* Delete button ξεχωριστά */}
                <DeleteButton
                  onDelete={() => setIncomeItems(incomeItems.filter((_, i) => i !== index))}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddMoneyProfit;
