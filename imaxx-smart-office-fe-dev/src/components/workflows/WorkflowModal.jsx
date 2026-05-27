import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import DataTable from "@/components/table/DataTable";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { getAllLeaveStateOptions } from "../../constants/leaveRequest/leaveRequestOptions";

const validateInputName = (value) => {
  if (value === "" || !value) {
    return "Name is required";
  }
};

const getColumnsWorkflowDetails = ({ register, remove, errors, roles, t }) => {
  const validateInputRole = (value) => {
    if (value === "" || !value) {
      return t("validation:required-field", {field: t("common:form.role")});
    }
  };

  const confirmDelete = async (onConfirm) => {
    const result = await Swal.fire({
      title: "Confirm",
      text: "Confirm to delete",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      onConfirm();
    }
  };
  return [
    {
      header: "#",
      accessorKey: "no",
      cell: ({ row }) => (
        <div className="seq-column table mb-0">
          <input
            className={`form-control text-center ${errors.workflow_details?.[row.index]?.seq ? "is-invalid" : ""
              }`}
            {...register(`workflow_details.${row.index}.seq`, {
              required: true,
            })}
          />
        </div>
      ),
    },
    {
      header: t("common:form.workflow-detail-name"),
      accessorKey: "workflow-detail-name",
      cell: ({ row }) => {
        return (
          <>
            <input
              className={`form-control ${errors.workflow_details?.[row.index]?.name ? "is-invalid" : ""
                }`}
              {...register(`workflow_details.${row.index}.name`, {
                validate: (value) => validateInputName(value),
              })}
            />
            {errors.workflow_details?.[row.index]?.name && (
              <small className="text-danger text-small">
                {errors.workflow_details[row.index].name.message}
              </small>
            )}
          </>
        );
      },
    },
    {
      header: t("common:form.state"),
      accessorKey: "workflow-state",
      cell: ({ row }) => (
        <>
          <select
            className={`form-select ${errors.workflow_details?.[row.index]?.state ? "is-invalid" : ""
              }`}
            {...register(`workflow_details.${row.index}.state`, {
              validate: (value) => validateInputRole(value),
            })}
          >
            <option value="">{t("common:label.select-field", {field:t("common:form.role")})}</option>
            { getAllLeaveStateOptions(t).map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {errors.workflow_details?.[row.index]?.state && (
            <small className="text-danger">
              {errors.workflow_details[row.index].state.message}
            </small>
          )}
        </>
      ),
    },
    {
      header: t("common:form.role"),
      accessorKey: "role",
      cell: ({ row }) => (
        <>
          <select
            className={`form-select ${errors.workflow_details?.[row.index]?.role_id ? "is-invalid" : ""
              }`}
            {...register(`workflow_details.${row.index}.role_id`, {
              validate: (value) => validateInputRole(value),
            })}
          >
            <option value="">{t("common:label.select-field", {field:t("common:form.role")})}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {errors.workflow_details?.[row.index]?.role_id && (
            <small className="text-danger">
              {errors.workflow_details[row.index].role_id.message}
            </small>
          )}
        </>
      ),
    },
    {
      header: t("common:form.status"),
      accessorKey: "status",
      cell: ({ row }) => (
        <input
          type="checkbox"
          className={`form-check-input ${errors.workflow_details?.[row.index]?.status ? "is-invalid" : ""
            }`}
          {...register(`workflow_details.${row.index}.status`)}
        />
      ),
    },
    {
      header: t("common:form.final"),
      accessorKey: "final",
      cell: ({ row }) => (
        <input
          type="checkbox"
          className={`form-check-input ${errors.workflow_details?.[row.index]?.is_final ? "is-invalid" : ""
            }`}
          {...register(`workflow_details.${row.index}.is_final`)}
        />
      ),
    },
    {
      header: t("common:form.action"),
      accessorKey: "action",
      cell: ({ row }) => (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => confirmDelete(() => remove(row.index))}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      ),
    },
  ];
};

WorkflowModal.propTypes = {
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  roles: PropTypes.array,
  loading: PropTypes.bool,
};

export default function WorkflowModal({ onClose, onSubmit, initialData, roles ,loading }) {
  const { t } = useTranslation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      status: true,
      workflow_details: [],
    },
  });

  const {
    fields: detailFields,
    append: addStep,
    remove: removeDetails,
    replace: replaceDetails,
  } = useFieldArray({
    control,
    name: "workflow_details",
    rules: {
      validate: (value) =>
        value.length > 0 || t("validation:field-at-lease-one", {field: t("common:form.workflow-detail")}),
    },
  });

  const isEdit = !!initialData;
  const statusValue = watch("status");


  useEffect(() => {
    if (!initialData) return;

    const tmpRoleIds = initialData.roles?.map((r) => r.id) || [];

    reset({
      ...initialData,
      role_ids: tmpRoleIds,
    });

    replaceDetails(initialData.workflow_details || []);
  }, [initialData, replaceDetails, reset]);

  // function
  const submitForm = async (data) => {
    const payload = {
      ...data,
      status: data.status ? 1 : 0,
      workflow_details: data.workflow_details.map((w, index) => ({
        ...w,
        state: typeof(w.state) === "string" ? Number.parseInt(w.state) : w.state ,
        seq: index + 1,
        status: w.status ? 1 : 0,
        is_final: w.is_final ? 1 : 0,
      })),
    };
    await onSubmit(payload);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                {t(`common:form.${isEdit ? "edit" : "create"}`, { field: t("common:form.workflow") })}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <div className="d-flex flex-column">
                    <label className="form-label required">{t("common:form.workflow-name")}</label>
                    <input
                      className="form-control"
                      placeholder={t("common:form.workflow-name")}
                      {...register("name", { required: true,})}
                    />
                    {errors.name && (
                      <small className="text-danger mt-1">
                        {t("validation:required-field",{field: t("common:form.workflow")})}
                      </small>
                    )}
                  </div>
                </div>


                {/* ================= Workflow Detail ================= */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex flex-column">
                      <h6 className="required mb-0">{t("common:form.workflow-detail")}</h6>
                      {errors.workflow_details?.root && (
                        <small className="text-danger">
                          {errors.workflow_details.root.message}
                        </small>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-younger-primary"
                      onClick={() => {
                        const currentDetails = getValues("workflow_details") || [];

                        const updated = currentDetails.map(d => ({
                          ...d,
                          is_final: false,
                        }));

                        replaceDetails([
                          ...updated,
                          {
                            name: "",
                            role_id: "",
                            seq: updated.length + 1,
                            is_final: true,
                            status: true,
                          },
                        ]);
                      }}
                    >
                      <FontAwesomeIcon icon={faPlusCircle} /> {t("common:form.add", {field: t("common:form.detail")})}
                    </button>
                  </div>
                  <DataTable
                    key={isEdit ? `edit-${initialData?.id}` : "create"}
                    data={detailFields}
                    columns={getColumnsWorkflowDetails({
                      register,
                      remove: (index) => {
                        const currentDetails = getValues("workflow_details") || [];
                        const updated = currentDetails.filter((_, i) => i !== index);
                        if (updated.length > 0) {
                          updated[updated.length - 1].is_final = true;
                        }

                        replaceDetails(updated);
                      },
                      errors,
                      roles,
                      t
                    })}
                    loading={false}
                  />
                </div>
                {/*  ================= Status =================  */}
                <div className="mb-3">
                  <label className="form-label">{t("common:form.status")}</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="status"
                      {...register("status", { required: false })}
                    />
                    <label className="form-check-label" htmlFor="status">
                      {t(`common:form.${statusValue ? "active" : "inactive"}`)}
                    </label>
                  </div>
                  {errors.status && (
                    <small className="text-danger">{t("validation:required-field",{field: t("common:form.status")})}</small>
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
                {t("common:button.cancel")}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleSubmit(submitForm)}
              >
                {loading && <span className="spinner-border text-light spinner-border-sm me-2"></span>}
                {t(`common:button.${isEdit ? "save" : "create"}`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
