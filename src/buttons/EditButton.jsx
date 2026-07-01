
const EditButton = ({ onEdit }) => (
  <button
    type="button"
    className="btn btn-outline-primary btn-sm touch-icon-btn"
    onClick={onEdit}
    aria-label="Edit entry"
    title="Edit entry"
  >
    <i className="fa-solid fa-pen-to-square" aria-hidden></i>
  </button>
);

export default EditButton;
