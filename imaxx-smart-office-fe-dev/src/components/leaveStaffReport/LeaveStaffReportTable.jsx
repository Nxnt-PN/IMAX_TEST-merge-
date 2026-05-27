import DataTable from "@/components/table/DataTable";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import ProfileViewer from "@/components/ProfileViewer";
import PropTypes from "prop-types";
import Can from "@/components/Can";

const getColumns = ({ t, mode }) => {
  const cols = [
    {
      accessorKey: "no",
      header: <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "user",
      header: t("common:form.user"),
      cell: ({ row }) => {
        const fullname = `${row.original.full_name}`;
        return (
          <div className="user-details-col">
            <div className="user-details d-flex">
              <div className="me-2 mt-1 user-details-avatar">
                <ProfileViewer name={fullname} size={40} filePath={row.original.avatar} className="" profileFor="others" />
              </div>
              <div className="user-details-name">
                <div className="name text-capitalize ">{fullname}</div>
                <div className="username ">@{row.original.username}</div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sick-leave",
      header: `${t("common:form.sick")}`,
      cell: ({ row }) => {
        return <span>{row.original?.sick}</span>;
      },
    },
    {
      accessorKey: "annual-leave",
      header: `${t("common:form.annual")}`,
      cell: ({ row }) => {
        return <span>{row.original?.annual}</span>;
      },
    },
    {
      accessorKey: "absence-leave",
      header: `${t("common:form.absence")}`,
      cell: ({ row }) => {
        return <span>{row.original?.absence}</span>;
      },
    },
    {
      accessorKey: "other-leave",
      header: `${t("common:form.other")}`,
      cell: ({ row }) => {
        return <span>{row.original?.other}</span>;
      },
    },
    {
      accessorKey: "work-experience",
      header: t("common:form.work-experience"),
      cell: ({ row }) => {
        const years = row.original?.tenure?.year || 0;
        const months = row.original?.tenure?.months || 0;
        const days = row.original?.tenure?.days || 0;

        return (
          <>
            {years > 0 && (
              <>
                <span className="fw-semibold">{years}</span>
                <span className="text-gray-500 text-sm mx-1">{t('common:form.year-abbreviate')}</span>
              </>
            )}

            {months > 0 && (
              <>
                <span className="fw-semibold">{months}</span>
                <span className="text-gray-500 text-sm mx-1">{t('common:form.month-abbreviate')}</span>
              </>
            )}

            {days > 0 && (
              <>
                <span className="fw-semibold">{days}</span>
                <span className="text-gray-500 text-sm mx-1">{t('common:form.day-abbreviate')}</span>
              </>
            )}
          </>
        );
      },
    },
    // {
    //   accessorKey: "location",
    //   header: t("common:form.location"),
    //   cell: ({ row }) => {
    //     return <span>{row.original?.location}</span>;
    //   },
    // },
  ];

  if (mode == "edit") {
    return cols.filter((c) => c.accessorKey !== "user");
  }

  return cols;
};

LeaveStaffReportTable.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  mode: PropTypes.string,
  authPermissions: PropTypes.array,
  PERMISSION: PropTypes.object,
};

export default function LeaveStaffReportTable({
  data,
  loading,
  mode,
  authPermissions,
  PERMISSION,
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  return (
    <div
      className=""
      key={`staff-report-table-${id}`}
      id={`staff-report-table-${id}`}
    >
      <DataTable
        data={data}
        columns={getColumns({ t, i18n, mode, authPermissions, PERMISSION })}
        loading={loading}
        mode={mode}
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
      />
    </div>
  );
}
