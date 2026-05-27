import Gravatar from "react-gravatar";
import { useId } from "react";
import { selectProfilePath } from "@/stores/slices/authSlice";
import { config } from '@/config/config';
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

ProfileViewer.propTypes = {
  filePath: PropTypes.string,
  name: PropTypes.string,
  defaultImage: PropTypes.string,
  profileFor: PropTypes.oneOf(["me", "others"])
}

export default function ProfileViewer({
  filePath = null,
  name = "iMAXX Solution",
  defaultImage = "retro",
  profileFor="others"
}) {
  const id = useId();
  const profilePath = useSelector(selectProfilePath);
  const path = profileFor === "me" ? profilePath : filePath;
  const fileUrl = path ? `${config.apiBaseURL}/${path}` : null;
  return (
    <div className="profile-viewer" id={`${id}-profile-viewer`}>
      <div className="avatar-preview">
        {   fileUrl
            ? (<img src={fileUrl} alt="Avatar" className="avatar-image" />)
            : ( <Gravatar
                  email={name}
                  size={100}
                  default={defaultImage}
                  className="avatar-image"
                />
              )}
      </div>
    </div>
  );
}
