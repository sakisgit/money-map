

const DeleteButton = ({onDelete}) => {
  const handleClick= () =>{
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if(confirmDelete) {
      onDelete();
    };
  };
  return (
    <button
      type="button"  
      className="btn btn-danger btn-sm mx-2"
      onClick={handleClick}
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  )
}

export default DeleteButton