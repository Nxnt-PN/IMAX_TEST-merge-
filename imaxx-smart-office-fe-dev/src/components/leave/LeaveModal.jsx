import LeaveForm from "./LeaveForm";
import { useId } from "react";
import PropTypes from "prop-types";

LeaveModal.propTypes = {
  open: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  onFileChanged: PropTypes.func.isRequired,
  PERMISSION: PropTypes.object.isRequired,
  authPermissions: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};


export default function LeaveModal({ open, data, onClose, onSubmit, mode, onFileChanged, PERMISSION, authPermissions, loading }) {
  const id = useId();

  if (!open) return null;
  return (
    <div key={id} id={`leave-modal-${id}`}>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
              <LeaveForm
                data={data}
                element="modal"
                onClose={onClose}
                onSubmit={onSubmit}
                mode={mode}
                onFileChanged={onFileChanged}
                PERMISSION={PERMISSION}
                authPermissions={authPermissions}
                loading={loading}
              />
          </div>
        </div>
      </div>
    </div>
  );
}
