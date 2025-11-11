
import { useContext, useState, useEffect, useRef } from "react";
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
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const listContainerRef = useRef(null);

  const { gifUrl, showGif } = useGiphyGif();
  const fullDate = useFullDate();

  // Calculate filtered items first
  const filteredItems = incomeItems.filter(item =>
    item.text.toLowerCase().includes(filterProfit.toLowerCase())
  );

  useEffect(() => {
    const savedIncome = localStorage.getItem('incomeItems');
    if (savedIncome) setIncomeItems(JSON.parse(savedIncome));
  }, []);

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
                  let value = e.target.value.replace(/\d/g, '');
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
            <button type="submit" className="btn btn-primary text-white w-100 w-sm-auto mb-2">Add Income</button>
          </form>
        </div>
      </div>

      {/* Dynamic Income List */}
      <div className="mt-3 position-relative">
        {filterProfit && filteredItems.length === 0 ? (
          <p className="text-center text-muted fst-italic py-3">❌ No matching income found.</p>
        ) : (
          <>
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
              style={{
                maxHeight: 'calc(4 * (80px + 0.5rem))',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '4px',
                position: 'relative'
              }}
            >
            {filteredItems.map((item) => (
              <div className="card my-2 shadow-sm" key={item.id}>
                <div className="card-body p-3">
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                    
                    {/* Left section: text + date */}
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                      {/* Income text */}
                      <span className="fw-semibold" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: '1 1 auto',
                        fontSize: '0.95rem'
                      }}>
                        {item.text}
                      </span>

                      {/* Date badge */}
                      <span className="badge date-badge">
                        {item.fullDate}
                      </span>
                    </div>

                    {/* Right section: amount + GIF + delete */}
                    <div className="d-flex align-items-center gap-2">
                      {/* Amount */}
                      <span className="fw-bold text-success" style={{ 
                        whiteSpace: 'nowrap',
                        fontSize: '1rem'
                      }}>
                        {formatMoney(item.amount)} €
                      </span>

                      {/* GIF */}
                      {gifUrl && item.id === incomeItems[incomeItems.length - 1]?.id && (
                        <img
                          src={gifUrl}
                          alt="income gif"
                          className="d-none d-sm-block"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "8px"
                          }}
                        />
                      )}

                      {/* Delete button */}
                      <DeleteButton
                        onDelete={() => {
                          const updated = incomeItems.filter(li => li.id !== item.id);
                          setIncomeItems(updated);
                          localStorage.setItem('incomeItems', JSON.stringify(updated));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddMoneyProfit;
