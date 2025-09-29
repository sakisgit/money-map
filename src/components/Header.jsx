
const Header = () => {
  return (
    <header className="d-sm-flex justify-content-between align-items-center bg-primary text-white text-center py-2 px-5">
      <h1>
        <i className="fa-solid fa-coins"></i> Money Map
      </h1>
      <div>
        <button
          className="btn btn-outline-light mx-3"
          data-bs-toggle="modal"
          data-bs-target="#limit-modal"
        >
          Set Monthly Limit
        </button>
        <button id="reset" className="btn btn-outline-light">
          Reset Month
        </button>
      </div>
    </header>
  );
};

export default Header;
