import Gravatar from "react-gravatar";
import { faCamera } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { config } from '@/config/config';

export default function ProfileUploader({
  filePath = null,
  name = "iMAXX Solution",
  size = 100,
  defaultImage = "retro",
  isPreview = true,
  onFileChanged,
}) {
  const profileUploadInput = useRef(null);
  const [file, setFile] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const validateFileSizeAndType = (file, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error(`File "${file.name}" has over ${maxSizeMB} MB`);
      return false;
    }

    if (
      file.type !== "image/png" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/jpg"
    ) {
      toast.error(`Support image only`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!validateFileSizeAndType(selected)) return;

    const previewUrl = URL.createObjectURL(selected);

    setFile({
      raw: selected,
      preview: previewUrl,
    });

    const formData = new FormData();
    formData.append("file", selected);

    onFileChanged?.(formData, previewUrl);

    e.target.value = null;
  };

  const handleDelete = () => {
    setFile(null);
    toast.success("Delete file success");
  };

  const fileUrl = filePath ? `${config.apiBaseURL}/${filePath}` : null;

  return (
    <div className="profile-uploader">
      <div
        className="avatar-preview"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        onClick={() => setShowOverlay(true)}
      >
        {  file || fileUrl ? (
          <img src={ file?.preview || fileUrl} alt="Avatar" className="avatar-image" />
        ) : (
          <Gravatar
            email={name || "test"}
            size={size}
            default={defaultImage}
            className="avatar-image"
          />
        )}
        <div className={`upload-overlay ${showOverlay ? "show" : ""}`}>
          <button
            type="button"
            className="btn avatar-upload-btn"
            onClick={() => profileUploadInput.current.click()}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
        </div>
      </div>

      {isPreview && (
        <input
          type="file"
          hidden
          accept="image/png, image/jpeg"
          ref={profileUploadInput}
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}
