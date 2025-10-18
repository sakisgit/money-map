
import { useState } from "react";

const UserSettingButton = () => {

  const [show, setShow] = useState(false);
  
  return (
    <button className="btn btn-outline-light header-btn d-flex align-items-center gap-2">
      <i className="fa-solid fa-user-circle"></i>
      <span>User Settings</span>
    </button>
  );
}

export default UserSettingButton;