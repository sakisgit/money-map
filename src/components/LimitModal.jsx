
const LimitModal = ({ id, title, placeholder, onSubmit }) => {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id={`${id}Label`}>{title}</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor={id + "-input"} className="form-label">{title}</label>
                <input type="text" className="form-control" id={id + "-input"} placeholder={placeholder} />
              </div>
              <button type="submit" className="btn btn-primary text-white">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitModal;
