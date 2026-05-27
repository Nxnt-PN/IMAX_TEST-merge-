import LeaveForm from "./LeaveForm";
import { useId } from "react";
import  PropTypes from "prop-types";


LeaveCardList.propTypes = {
  data: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onFileChanged: PropTypes.func.isRequired,
  PERMISSION: PropTypes.object.isRequired,
  authPermissions: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default function LeaveCardList({ data, onView, mode, onSubmit, onFileChanged, PERMISSION, authPermissions, loading }) {
  const id = useId();
  return (
    <div className="d-md-none" id={id} key={id}>
      { data.map((item,index) => (
        <div key={`${index}-${id}-cardList`} id={`${index}-${id}-cardList`} className="card my-3">
          <div className="card-body">
            <LeaveForm
              data={item}
              element="card"
              onSubmit={onSubmit}
              onClose={() => onView(item)}
              mode={mode}
              onFileChanged={onFileChanged}
              PERMISSION={PERMISSION}
              authPermissions={authPermissions}
              loading={loading}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
