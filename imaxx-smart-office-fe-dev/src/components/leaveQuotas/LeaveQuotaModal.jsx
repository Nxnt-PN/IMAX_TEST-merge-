import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import DataTable from "@/components/table/DataTable";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

// global variables
const getColumns = ({ register, remove, errors, t }) => {
  const onDeleteDetail = async (rowIndex) => {
    const result = await Swal.fire({
      title:  t("common:label.confirm", {action:t("common:action.delete")}),
      text: t("common:label.confirm-subtitle"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common:button.confirm"),
      cancelButtonText: t("common:button.cancel"),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      remove(rowIndex);
    } else {
      console.log("cancelled");
    }
  };

  const validateWorkYearMin = (value, formValues, rowIndex) => {
    if (value === "") {
      return t("validate:required-field", { field: t("common:form.min-year") });
    }
    if (value < 0) {
      return t("validate:must-greater-than-field", {field: 0 });
    }
    const maxYear =
      formValues.leave_quota_details?.[rowIndex]?.work_year_max || null;
    if (value > maxYear || value == maxYear) {
      return t("validate:must-less-than-field",{ field: t('common:form.max-year')});
    }
  };

  const validateWorkYearMax = (value, formValues, rowIndex) => {
    if (value === "") {
      return t("validate:required-field", { field: t("common:form.max-year") });
    }
    if (value < 0) {
      return t("validate:must-greater-than-field", {field: 0 });
    }
    const minYear =
      formValues.leave_quota_details?.[rowIndex]?.work_year_min || null;
    if (value < minYear || value == minYear) {
      return t("validate:must-greater-than-field",{ field: t('common:form.min-year')});
    }
  };

  const validateNumberInput = (field, value, formValues, rowIndex) => {
    if (value === "") {
      return `${field} is required`;
    }
    if (value < 0) {
      return "Must be greater than 0";
    }
  };

  return [
    {
      header: `${ t('common:form.work-experience') } (${t('common:form.year')})`,
      accessorKey: "year",
      cell: ({ row }) => {
        const i = row.index;
        return (
          <div className="d-flex gap-1">
            <div className="">
              <input
                type="number"
                className={`form-control form-control-sm text-center form-number-input ${
                  errors.leave_quota_details?.[row.index]?.work_year_min
                    ? "is-invalid"
                    : ""
                }`}
                {...register(`leave_quota_details.${i}.work_year_min`, {
                  validate: (value, formValues) =>
                    validateWorkYearMin(value, formValues, i),
                })}
              />
            </div>
            <span>-</span>
            <div>
              <input
                type="number"
                className={`form-control form-control-sm text-center form-number-input ${
                  errors.leave_quota_details?.[row.index]?.work_year_max
                    ? "is-invalid"
                    : ""
                }`}
                {...register(`leave_quota_details.${i}.work_year_max`, {
                  validate: (value, formValues) =>
                    validateWorkYearMax(value, formValues, i),
                })}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: `${ t('common:form.absence') } (${t('common:form.day-per-year')})`,
      accessorKey: "absence",
      cell: ({ row }) => (
          <input
            type="number"
            className={`form-control form-control-sm text-center form-number-input ${
              errors.leave_quota_details?.[row.index]?.absence_quota
                ? "is-invalid"
                : ""
            }`}
            {...register(`leave_quota_details.${row.index}.absence_quota`, {
              required: true,
              validate: (value, formValues) =>
                validateNumberInput("absence", value, formValues),
            })}
          />
      ),
    },
    {
      header: `${ t('common:form.annual') } (${t('common:form.day-per-year')})`,
      accessorKey: "annual",
      cell: ({ row }) => (
          <input
            type="number"
            className={`form-control form-control-sm text-center form-number-input ${
              errors.leave_quota_details?.[row.index]?.annual_quota
                ? "is-invalid"
                : ""
            }`}
            {...register(`leave_quota_details.${row.index}.annual_quota`, {
              required: true,
              validate: (value, formValues) =>
                validateNumberInput("annual", value, formValues),
            })}
          />
      ),
    },
    {
      header: `${ t('common:form.sick') } (${t('common:form.day-per-year')})`,
      accessorKey: "sick",
      cell: ({ row }) => (
          <input
            type="number"
            className={`form-control form-control-sm text-center form-number-input ${
              errors.leave_quota_details?.[row.index]?.sick_quota
                ? "is-invalid"
                : ""
            }`}
            {...register(`leave_quota_details.${row.index}.sick_quota`, {
              required: true,
              validate: (value, formValues) =>
                validateNumberInput("sick", value, formValues),
            })}
          />
      ),
    },
    {
      header: `${ t('common:form.other') } (${t('common:form.day-per-year')})`,
      accessorKey: "other",
      cell: ({ row }) => (
          <input
            type="number"
            className={`form-control form-control-sm text-center form-number-input ${
              errors.leave_quota_details?.[row.index]?.other_quota
                ? "is-invalid"
                : ""
            }`}
            {...register(`leave_quota_details.${row.index}.other_quota`, {
              required: true,
              validate: (value, formValues) =>
                validateNumberInput("other", value, formValues),
            })}
          />
      ),
    },
    {
      header: t("common:form.status"),
      accessorKey: "status",
      cell: ({ row }) => (
            <input
            type="checkbox"
            className={`form-check-input text-center ${
              errors.leave_quota_details?.[row.index]?.status
                ? "is-invalid"
                : ""
            }`}
            {...register(`leave_quota_details.${row.index}.status`)}
          />),
    },
    {
      header: t("common:form.action"),
      accessorKey: "action",
      cell: ({ row }) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDeleteDetail(row.index)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      ),
    },
  ];
};

// Component Props validate
LeaveQuotaModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
};

export default function LeaveQuotaModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) {
  const { t } = useTranslation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      year: "",
      status: true,
      leave_quota_details: [],
    },
    shouldUnregister: true, // ⭐ important
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "leave_quota_details",
    rules: {
      validate: (value) => value?.length > 0 ||  t("validation:field-at-lease-one", {field: t("common:form.quota-detail")}) ,
    },
  });

  const statusValue = watch("status");
  const isEdit = !!initialData;

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        ...initialData,
        status: Boolean(initialData.status),
        leave_quota_details: initialData.leave_quota_details || [],
      });
    } else {
      reset({
        year: "",
        status: 1,
        leave_quota_details: [],
      });
      // reset leave_quota_details in useFieldArray
      replace([]);
    }
  }, [open, isEdit, initialData, replace, reset]);

  const onAddDetail = () => {
    append({
      work_year_min: 0,
      work_year_max: 1,
      absence_quota: 0,
      annual_quota: 0,
      sick_quota: 0,
      status: 1,
    });
  };

  const submitForm = (data) => {
    onSubmit(data);
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
                {t(`common:form.${isEdit ? "edit" : "create"}`, { field: t("common:form.leave-quota") })}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label required">{ t("common:form.year") }</label>
                  <input
                    className={`form-control ${ errors.year ? 'is-invalid' : ''}`}
                    name="year"
                    autoComplete="off"
                    placeholder={ t("common:form.year") }
                    type="number"
                    {...register("year", { required: true })}
                  />
                  {errors.year && (
                    <small className="text-danger">{ t("validation:required-field", {field: t("common:form.year")}) }</small>
                  )}
                </div>
                <div className="leave-quota-details">
                  <div className="title-box quota-details d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex flex-column">
                      <h6 className="required mb-0">{ t("common:form.quota-detail") }</h6>
                      {errors.leave_quota_details?.root && (
                        <small className="text-danger">
                          {errors.leave_quota_details.root.message}
                        </small>
                      )}
                    </div>
                    <button
                      className="btn btn-younger-primary"
                      type="button"
                      onClick={onAddDetail}
                    >
                      <FontAwesomeIcon icon={faPlusCircle} /> { t("common:form.new", {field: t("common:form.quota-detail")}) }
                    </button>
                  </div>
                  <DataTable
                    key={isEdit ? `edit-${initialData?.id}` : "create"}
                    data={fields}
                    columns={getColumns({ register, remove, errors, t })}
                    loading={false}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{ t("common:form.status") }</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="status"
                      {...register("status", { required: false })}
                    />
                    <label className="form-check-label" htmlFor="status">
                      { t(`common:form.${statusValue ? "active" : "inactive"}`) }
                    </label>
                  </div>
                  {errors.status && (
                    <small className="text-danger">{ t("validation:required-field", {field: t("common:form.status")}) }</small>
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
                {t(`common:button.${isEdit ? "save" : "create"}`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
