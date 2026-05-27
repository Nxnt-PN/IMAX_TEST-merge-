import moment from "moment";
import DataTable from "@/components/table/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { leaveStateBadge } from "@/constants/leaveRequest/leaveRequestOptions";
import { LEAVE_STATE, LEAVE_TYPE } from "@/constants/leaveRequest/leaveRequestEnum"
import { LEAVE_STATE_LABEL, LEAVE_TYPE_LABEL } from "@/constants/leaveRequest/leaveRequestLabel";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import ProfileViewer from "@/components/ProfileViewer"
import PropTypes from "prop-types";
import Can from "@/components/Can";
import { config } from "@/config/config";



const getColumns = ({ onView, onDelete, t, mode, authPermissions, PERMISSION }) => {
  const isEditMode = mode === 'edit';
  const cols = [
  {
    accessorKey: "no",
    header: (<div className="text-center">#</div>),
    cell: ({ row }) => (<div className="text-center">{row.index + 1}</div>),
  },
  {
    accessorKey: "user",
    header: t('common:form.user') ,
    cell: ({ row }) => {
        const fullname = `${row.original.user.first_name} ${row.original.user.last_name}`;
        const filePath = row.original.user.avatar_path;
        return (
          <div className="user-details-col">
          <div className="user-details d-flex">
            <div className="me-2 mt-1 user-details-avatar">
              <ProfileViewer name={fullname} filePath={filePath} size={10} className="" profileFor="others" />
            </div>
            <div className="user-details-name">
              <div className="name text-capitalize ">{fullname}</div>
              <div className="username ">
                @{row.original.user.username}
              </div>
            </div>
          </div>
          </div>
        );
      },
  },
  {
    accessorKey: "leave-period",
    header: t('common:form.leave-period'),
    cell: ({ row }) =>{
      const startDate = row.original.start_date ? moment.parseZone(row.original.start_date).format("DD/MM/YYYY HH:mm") : null;
      const endDate = row.original.end_date ? moment.parseZone(row.original.end_date).format("DD/MM/YYYY HH:mm") : null;
      const [sDate, sTime] = startDate.split(' ');
      const [eDate, eTime] = endDate.split(' ');
      return (<div className="d-flex flex-column ">
    {/* Start Date */}
    <div className="d-flex justify-content-start align-items-center">
      <small className="fw-semibold text-success from-to-text">{t('common:form.from')}:</small>
      <div className="date">
        <span className="">{sDate}</span>
        <small className="text-muted ms-1" >{sTime}</small>
      </div>
    </div>

    {/* End Date */}
    <div  className="d-flex justify-content-start align-items-center">
      <small className="fw-semibold text-danger from-to-text" >{t('common:form.to')}:</small>
      <div className="date">
        <span className="">{eDate}</span>
        <small className="text-muted ms-1" >{eTime}</small>
      </div>
    </div>
  </div>)}
  },
  {
    accessorKey: "leave_type",
    header: t('common:form.type'),
    cell: ({ row }) =>(
      <div className="leave-type-col" >{t(`common:leave-type.${LEAVE_TYPE_LABEL[row.original.leave_type]}`)}</div>)
  },
  {
    accessorKey: "days",
    header: t('common:form.days'),
    cell: ({ row }) => (<div className="text-center">{row.original.total_days}</div>),
  },
  {
    accessorKey: "reason",
    header: t('common:form.reason'),
    cell: ({ row }) => (<div className="reason-col">{row.original.reason}</div>)
  },
  {
    accessorKey: "state",
    header: t('common:form.status'),
    cell: ({ row }) => (
      <span className={leaveStateBadge(row.original.state)}>
        { row.original.state ? t(`common:leave-state.${LEAVE_STATE_LABEL[row.original.state]}`): '' }
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: t('common:form.action'),
    cell: ({ row }) => (<>
      <Can
        required={[PERMISSION.VIEW_LEAVE_FORM, PERMISSION.VIEW_MY_TASK, PERMISSION.VIEW_REPORT]}
        permissions={authPermissions}
        isAll={false}
        >
        <button
          className="btn btn-sm btn-outline-primary me-1 my-1"
          onClick={() => onView(row.original)}
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
      </Can>
      { isEditMode && (
        <Can required={[PERMISSION.DELETE_LEAVE_FORM]} permissions={authPermissions}>
          <button
            className="btn btn-sm btn-outline-danger me-1 my-1"
            onClick={() => onDelete(row.original)}
            disabled={row.original.state !== LEAVE_STATE.DRAFT && row.original.state !== LEAVE_STATE.CANCELLED}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </Can>)
      }
    </>
    ),
  },
];

if(isEditMode) {
  return cols.filter((c)=> c.accessorKey !== 'user')
}

return cols
}

LeaveTable.propTypes = {
  data: PropTypes.array,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  loading: PropTypes.bool,
  mode: PropTypes.string,
  authPermissions: PropTypes.array,
  PERMISSION: PropTypes.object,
}

export default function LeaveTable({ data, onView, onDelete = () => {}, loading , mode, authPermissions, PERMISSION}) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div className="d-none d-md-block" key={`leave-table-${id}`} id={`leave-table-${id}`} >
      <DataTable
        data={data}
        columns={getColumns({ onView, onDelete, t , mode, authPermissions, PERMISSION })}
        loading={loading}
        mode={mode}
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
      />
    </div>
  );
}