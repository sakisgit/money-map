
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { useGiphyGif } from "../hooks/useGiphyGif";
import { useFullDate } from "../hooks/useFullDate";
import Swal from "sweetalert2";
import { toLocalDateKey } from "../utils/dateKey";
import PaymentMethodToggle from "./PaymentMethodToggle";
import MoneyListItem from "./MoneyListItem";

const AddMoneyProfit = () => {
  const { 
    incomeItems, setIncomeItems, 
    filterProfit, formatMoney 
  } = useContext(AppContext);

  const [incomeText, setIncomeText] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const listContainerRef = useRef(null);

  const { gifUrl, showGif } = useGiphyGif();
  const fullDate = useFullDate();

  // Calculate filtered items first (case-insensitive)
  const filteredItems = incomeItems.filter(item =>
    item.text.toLowerCase().includes(filterProfit.toLowerCase())
  );

  // Group items by normalized name (case-insensitive) and calculate totals
  const groupedTotals = filteredItems.reduce((acc, item) => {
    const normalizedName = item.text.toLowerCase().trim();
    if (!acc[normalizedName]) {
      acc[normalizedName] = {
        displayName: item.text, // Keep original case of first occurrence
        total: 0,
        count: 0
      };
    }
    acc[normalizedName].total += item.amount;
    acc[normalizedName].count += 1;
    return acc;
  }, {});

  // Convert to array and filter groups with multiple items
  const summaryGroups = Object.entries(groupedTotals)
    .filter(([_, data]) => data.count > 1)
    .map(([_, data]) => data);

  // Check scroll position for fade indicators
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container || filteredItems.length <= 4) {
      setShowTopFade(false);
      setShowBottomFade(false);
      return;
    }

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 10;
      const canScrollUp = scrollTop > 10;
      
      setShowTopFade(canScrollUp);
      setShowBottomFade(canScrollDown);
    };

    // Initial check
    setTimeout(checkScroll, 100);

    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [filteredItems]);

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
      dateKey: toLocalDateKey(),
      text: incomeText,
      amount: amountValue,
      paymentMethod,
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
      setPaymentMethod('cash');
    });
  };

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
                maxLength={28}
                onChange={(e) => {
                  let value = e.target.value.replace(/\d/g, '');
                  const maxLength = 28;
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
            <PaymentMethodToggle
              idPrefix="profit"
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
            <button type="submit" className="btn btn-primary btn-sm text-white money-form__submit-btn mb-2">Add Income</button>
          </form>
        </div>
      </div>

      {/* Dynamic Income List */}
      <div className="mt-3 position-relative">
        {filterProfit && filteredItems.length === 0 ? (
          <p className="text-center text-muted fst-italic py-3">❌ No matching income found.</p>
        ) : (
          <>
            {/* Summary Section - Show totals for grouped items */}
            {filterProfit && summaryGroups.length > 0 && (
              <div className="card mb-3 shadow-sm income-summary-card">
                <div className="card-body p-3">
                  <h6 className="fw-bold mb-3 income-summary-title">
                    <i className="fa-solid fa-calculator me-2"></i>
                    Search Summary
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    {summaryGroups.map((group, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center p-2 income-summary-item rounded">
                        <span className="fw-semibold">{group.displayName}:</span>
                        <span className="fw-bold text-success fs-5">
                          {formatMoney(group.total)} €
                          {group.count > 1 && (
                            <small className="text-muted ms-2">({group.count} items)</small>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Fade Indicator */}
            {showTopFade && filteredItems.length > 4 && (
              <div className="scroll-fade-top">
                <i className="fa-solid fa-chevron-up"></i>
                <span>Scroll up</span>
              </div>
            )}
            
            {/* Bottom Fade Indicator */}
            {showBottomFade && filteredItems.length > 4 && (
              <div className="scroll-fade-bottom">
                <i className="fa-solid fa-chevron-down"></i>
                <span>Scroll down</span>
              </div>
            )}

            <div 
              ref={listContainerRef}
              className="income-list-container"
            >
            {filteredItems.map((item) => (
              <MoneyListItem
                key={item.id}
                item={item}
                amountClass="text-success"
                formatMoney={formatMoney}
                onDelete={() => {
                  const updated = incomeItems.filter((li) => li.id !== item.id);
                  setIncomeItems(updated);
                  localStorage.setItem("incomeItems", JSON.stringify(updated));
                }}
              />
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddMoneyProfit;
