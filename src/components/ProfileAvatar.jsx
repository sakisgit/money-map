import { getInitials } from "../utils/profile";

/** The profile picture, or initials on the chosen color, or a person icon. */
const ProfileAvatar = ({ profile, size = 40, className = "" }) => {
  const initials = getInitials(profile?.name);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (profile?.photo) {
    return (
      <img
        src={profile.photo}
        alt=""
        className={`profile-avatar ${className}`}
        style={style}
      />
    );
  }

  return (
    <span
      className={`profile-avatar profile-avatar--initials ${className}`}
      style={{ ...style, background: profile?.color || "#2563eb" }}
      aria-hidden
    >
      {initials || <i className="fa-solid fa-user"></i>}
    </span>
  );
};

export default ProfileAvatar;
