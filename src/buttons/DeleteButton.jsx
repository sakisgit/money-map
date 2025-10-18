
import Swal from "sweetalert2";

const DeleteButton = ({onDelete}) => {
  const handleClick= () =>{
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
        Swal.fire({
          title: 'Deleted!',
          text: 'Your item has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      };
    });
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