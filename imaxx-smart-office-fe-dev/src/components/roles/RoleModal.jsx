import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import TransferList from "@/components/TransferList";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

RoleModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
};

export default function RoleModal({
  open,
  onClose,
  onSubmit,
  initialData,
  permissions,
  roles,
  loading,
}) {

  const { t } = useTranslation();
  const {
    watch,
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      permission_ids: [],
      child_role_ids: [],
      status: 1,
    },
  });
  const statusValue = watch('status');
  const isEdit = !!initialData;


  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const tmpData = {
        ...initialData,
        permission_ids: initialData.permissions.map((p) => p.id) || [],
        child_role_ids: initialData?.child_roles?.map((c) => c.id) || [],
        status: initialData.status,
      };
      reset(tmpData);
    } else {
      reset({
        name: "",
        permission_ids: [],
        child_role_ids: [],
        status: 1,
      });
    }
  }, [initialData, open, reset]);

  // function
  const getRoleNormalize = () => {
    const list = [];
    if (initialData) {
      list.push(...roles.filter((r) => r.id !== initialData.id));
    } else {
      list.push(...roles);
    }
    return list;
  };

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
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">

              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {t(`common:form.${isEdit ? "edit" : "create"}`, { field: t("common:form.role") })}
                </h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>

              {/* Body */}
              <div className="modal-body">
                <form>
                    <div className="mb-3">
                      <label className="form-label required">{ t("common:form.name") }</label>
                      <input
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        {...register("name", { required: true })}
                      />
                      {errors.name && (
                        <small className="text-danger">{ t("validation:required-field", {field: t("common:form.name")}) }</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label required">{ t("common:form.permission") }</label>
                      <Controller
                        name="permission_ids"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TransferList
                            label={"name"}
                            options={permissions}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {errors.permission_ids && (
                        <small className="text-danger">
                          { t("validation:required-field", {field: t("common:form.permission")}) }
                        </small>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{ t("common:form.child-role") }</label>
                      <Controller
                        key={roles.length}
                        name="child_role_ids"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <TransferList
                            label={"name"}
                            options={getRoleNormalize()}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {errors.child_role_ids && (
                        <small className="text-danger">
                          { t("validation:required-field", {field: t("common:form.child-role")}) }
                        </small>
                      )}
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
