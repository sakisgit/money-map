
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import { useGiphyGif } from "../hooks/useGiphyGif";
import { useFullDate } from "../hooks/useFullDate";
import Swal from "sweetalert2";

const AddMoneyProfit = () => {
  const { 
    incomeItems, setIncomeItems, 
    filterProfit, formatMoney 
  } = useContext(AppContext);
  const [incomeText, setIncomeText] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const { gifUrl, showGif } = useGiphyGif();
  const fullDate  = useFullDate();

  // Φόρτωση από localStorage
  useEffect(() => {
    const savedIncome = localStorage.getItem('incomeItems');
    if (savedIncome) setIncomeItems(JSON.parse(savedIncome));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!incomeText || !incomeAmount) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please complete all fields before adding an income.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const amountValue = parseFloat(incomeAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'The income amount must be greater than zero.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (/\d/.test(incomeText)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Text',
        text: 'The text must not contain numbers.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const newItem = { 
      id: Date.now(),
      fullDate: fullDate,
      text: incomeText, 
      amount: amountValue
    };

    const updatedIncomeItems = [...incomeItems, newItem];
    setIncomeItems(updatedIncomeItems);
    localStorage.setItem('incomeItems', JSON.stringify(updatedIncomeItems));

    showGif(incomeText || "profit", "profit");

    Swal.fire({
      icon: 'success',
      title: 'Income Added!',
      text: `"${incomeText}" has been added successfully.`,
      confirmButtonText: 'OK'
    }).then(() => {
      setIncomeText('');
      setIncomeAmount('');
    });
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
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/\d/g, ''); // αφαιρεί αριθμούς
                  const maxLength = 15; 
                  if (value.length > maxLength) value = value.slice(0, maxLength);
                  setIncomeText(value);
                }} 
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
          filteredItems.map((item) => (
            <div className="card my-2 shadow-sm" key={item.id}>
              <div className="card-body d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    fontWeight: 500
                  }}>
                    {item.text}
                  </span>

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

                  <span className="fw-bold" style={{ whiteSpace: 'nowrap' }}>
                    {formatMoney(item.amount)} €
                  </span>

                  {gifUrl && item.id === incomeItems[incomeItems.length - 1]?.id && (
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

                <DeleteButton
                  onDelete={() => {
                    const updated = incomeItems.filter(li => li.id !== item.id);
                    setIncomeItems(updated);
                    localStorage.setItem('incomeItems', JSON.stringify(updated));
                  }}
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
