import { useEffect } from "react";
import { useForm } from "react-hook-form";
import DataTable from "@/components/table/DataTable";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";


// Component Props validate
SystemModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
};

export default function SystemModal({ open, onClose, onSubmit, initialData, workflowList, loading }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      workflow_id: "",
      status: 1,
    },
    shouldUnregister: true, // ⭐ important
  });

  const isEdit = !!initialData;
  const statusValue = watch("status");
  const workflowIdValue = watch("workflow_id");
  const workflowDetailData =
    workflowList.find((w) => w.id === workflowIdValue)?.workflow_details || [];

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        workflow_id: initialData.workflow_id,
        status: initialData.status ?? 1
      });
    } else {
      reset({
        name: "",
        slug: "",
        workflow_id: "",
        status: 1,
      });
    }
  }, [open, isEdit, initialData, reset]);

  // column definition
  const columns = [
    {
      header: "#",
      accessorKey: "no",
      cell: ({ row }) => {
        return <div className="seq">{row.original.seq}</div>;
      },
    },
    {
      header: t('common:form.name'),
      accessorKey: "name",
      cell: ({ row }) => {
        return <div className="name">{row.original.name}</div>;
      },
    },
    {
      header: t('common:form.role'),
      accessorKey: "role",
      cell: ({ row }) => {
        return <div className="year">{row.original.role?.name}</div>;
      },
    },
    {
      header: t('common:form.status'),
      accessorKey: "status",
      cell: ({ row }) => {
        const classStyle = row.original.status ? 'badge active' : 'badge inactive'
        return (<span className={classStyle}>{t(`common:form.${row.original.status ? "active" : "inactive"}`)}</span>)
      },
    },
  ];

  // function
  const submitForm = (data) => {
    onSubmit({
      ...data,
      status: data.status ? 1 : 0,
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                {t(`common:form.${isEdit ? "edit" : "create"}`, { field: t("common:form.system") })}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label required">{t('common:form.system-name')}</label>
                  <input
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    name="name"
                    autoComplete="off"
                    placeholder={t('common:form.system-name')}
                    type="text"
                    disabled
                    {...register("name", { required: true })}
                  />
                  {errors.name && (
                    <small className="text-danger">
                      {t("validate:required-field", { field: t("common:form.system-name") })}
                    </small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label required">{ t("common:form.system-key") }</label>
                  <input
                    className={`form-control ${
                      errors.slug ? "is-invalid" : ""
                    }`}
                    name="slug"
                    autoComplete="off"
                    placeholder={ t("common:form.system-key") }
                    type="text"
                    disabled
                    {...register("slug", { required: true })}
                  />
                  {errors.slug && (
                    <small className="text-danger">
                      {t("validate:required-field", { field: t("common:form.system-key") })}
                    </small>
                  )}
                </div>
                <div className="mb-3">
                  <label
                    className="form-label required"
                    htmlFor="workflow-selector"
                  >
                    { t("common:form.workflow") }
                  </label>
                  <select
                    key={`workflow-selector-${workflowList.length}`}
                    className={`form-select ${
                      errors.workflow_id ? "is-invalid" : ""
                    }`}
                    id="workflow-selector"
                    {...register("workflow_id", { required: true })}
                  >
                    <option value="">{t("common:label.select-field", { field: t("common:form.system-name") })}</option>
                    {workflowList.map((w) => (
                      <option value={w.id} key={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>

                  {errors.workflow_id && (
                    <small className="text-danger">{t("validate:required-field", { field: t("common:form.workflow") })}</small>
                  )}
                </div>
                {workflowIdValue && (
                  <div className="mb-3">
                    <DataTable
                      key={isEdit ? `edit-${initialData?.id}` : "create"}
                      data={workflowDetailData}
                      columns={columns}
                      loading={false}
                    />
                  </div>
                )}

                <div className="mb-3 status-form">
                  <label className="form-label">{ t("common:form.status") }</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="status"
                      disabled
                      {...register("status", { required: false })}
                    />
                    <label
                      className="form-check-label user-select-none"
                      htmlFor="status"
                    >
                      { t(`common:form.${statusValue ? "active" : "inactive"}`)}
                    </label>
                  </div>
                  {errors.status && (
                    <small className="text-danger">{t("validate:required-field", { field: t("common:form.status") })}</small>
                  )}
                </div>
              </form>
            </div>
            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                { t("common:button.cancel") }
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleSubmit(submitForm)}
              >
                { loading && <span className="spinner-border text-light spinner-border-sm me-2"></span>}
                { t(`common:button.${isEdit ? "save" : "create"}`) }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
