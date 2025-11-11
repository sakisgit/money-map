
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import { useGiphyGif } from "../hooks/useGiphyGif";
import { useFullDate } from "../hooks/useFullDate";
import Swal from "sweetalert2";

const AddMoneyLoss = () => {
  const { 
    lossItems, setLossItems, 
    filterLoss, payment, 
    moneyRemaining, formatMoney 
  } = useContext(AppContext);
  
  const fullDate = useFullDate();
  const [lossText, setLossText] = useState('');
  const [lossAmount, setLossAmount] = useState('');
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const listContainerRef = useRef(null);

  const { gifUrl, showGif } = useGiphyGif();

  // Calculate filtered items first
  const filteredItems = lossItems.filter(item =>
    item.text.toLowerCase().includes(filterLoss.toLowerCase())
  );

  useEffect(() => {
    const savedLoss = localStorage.getItem('lossItems');
    if (savedLoss) setLossItems(JSON.parse(savedLoss));
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

    if (payment === 0 || moneyRemaining === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Set Income First',
        text: 'Please set your monthly income before adding any expenses.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!lossText || !lossAmount) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Fields',
        text: 'Please complete all fields before adding an expense.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const amountValue = parseFloat(lossAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'The expense amount must be greater than zero.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (/\d/.test(lossText)) {
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
      text: lossText, 
      amount: amountValue
    };

    const updatedLossItems = [newItem, ...lossItems];
    setLossItems(updatedLossItems);
    localStorage.setItem('lossItems', JSON.stringify(updatedLossItems));

    showGif(lossText || "loss", "loss");

    Swal.fire({
      icon: 'success',
      title: 'Expense Added!',
      text: `"${lossText}" has been added successfully.`,
      confirmButtonText: 'OK'
    }).then(() => {
      setLossText('');
      setLossAmount('');
    });
  };

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
                onChange={(e) => {
                  let value = e.target.value.replace(/\d/g, ''); 
                  const maxLength = 15; 
                  if (value.length > maxLength) value = value.slice(0, maxLength);
                  setLossText(value);
                }}
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
            <button type="submit" className="btn btn-primary text-white w-100 w-sm-auto mb-2">Add Expense</button>
          </form>
        </div>
      </div>

      {/* Dynamic Expense List */}
      <div className="mt-3 position-relative">
        {filterLoss && filteredItems.length === 0 ? (
          <p className="text-center text-muted fst-italic py-3">❌ No matching expenses found.</p>
        ) : (
          <>
            {/* Top Fade Indicator */}
            {showTopFade && filteredItems.length > 4 && (
              <div className="scroll-fade-top">
                <i className="fa-solid fa-chevron-up"></i>
                <span>Scroll up</span>
              </div>
            )}
            
            {/* Bottom Fade Indicator - Always show if more than 4 items and can scroll */}
            {filteredItems.length > 4 && (
              <>
                {showBottomFade && (
                  <div className="scroll-fade-bottom">
                    <i className="fa-solid fa-chevron-down"></i>
                    <span>Scroll down</span>
                  </div>
                )}
                {!showBottomFade && !showTopFade && (
                  <div className="scroll-fade-bottom">
                    <i className="fa-solid fa-chevron-down"></i>
                    <span>Scroll down</span>
                  </div>
                )}
              </>
            )}


            <div 
              ref={listContainerRef}
              className="expense-list-container"
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
                      {/* Expense text */}
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
                      <span className="fw-bold text-danger" style={{ 
                        whiteSpace: 'nowrap',
                        fontSize: '1rem'
                      }}>
                        {formatMoney(item.amount)} €
                      </span>

                      {/* GIF */}
                      {gifUrl && item.id === lossItems[0]?.id && (
                        <img
                          src={gifUrl}
                          alt="expense gif"
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
                          const updated = lossItems.filter(li => li.id !== item.id);
                          setLossItems(updated);
                          localStorage.setItem('lossItems', JSON.stringify(updated));
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

export default AddMoneyLoss;
