import { toast } from "react-toastify";

export const ShowToast = ({
  title,
  text = "",
  status = "success", // success | error | warning | info
}) => {
  const content = (
    <div>
      <strong>{title}</strong>
      {text && <div style={{ fontSize: 13 }}>{text}</div>}
    </div>
  );

  toast[status](content);
};
