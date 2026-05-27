import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TransferList from "@/components/TransferList";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

UserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  roles: PropTypes.array,
  loading: PropTypes.bool,
}


export default function UserModal({ open, onClose, onSubmit, initialData, roles, loading}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePwdFlag, setChangePwdFlag] = useState(false);


  const {
    setValue,
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employed_at: null,
    },
  });

  const isEdit = !!initialData;
  const statusValue = watch("status");
  const passwordValue = watch("password");

  useEffect(() => {
  if (!open) return;

  if (initialData) {
    const tmpRoleIds = initialData?.roles?.map(r => r.id) || [];

    reset({
      username: initialData.username || "",
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      email: initialData.email || "",
      role_ids: tmpRoleIds,
      employed_at: initialData.employed_at
        ? new Date(initialData.employed_at)
        : null,
      status: initialData.status === 1,
      password: "",
      confirm_password: "",
    });
    setChangePwdFlag(false)
  } else {
    reset({
      username: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      email: "",
      role_ids: [],
      employed_at: null,
      status: true,
    });
  }
}, [open, initialData, reset]);


  // function
  const validatePassword= (value) =>{
    // create mode
    // edit mode
    if(
      (!isEdit && !value) ||
      (isEdit && changePwdFlag && !value)
    ) {
      return t("validation:required-field",{field: t("common:form.password")});
    }
    return true;
  }

  const validateConfirmPassword = (value) => {
    // create mode
    if(!isEdit && !value) {
      return t("validation:required-field",{field: t("common:form.confirm-password")});
    }
    // create mode - password not match
    if(!isEdit && passwordValue !== value) {
      return t("validation:field-not-match",{field: t("common:form.password")});
    }
    // edit mode
    if(isEdit && changePwdFlag && !value) {
      return t("validation:required-field",{field: t("common:form.confirm-password")});
    }
     // edit mode - password not match
    if(isEdit && changePwdFlag && passwordValue !== value) {
      return t("validation:field-not-match",{field: t("common:form.password")});
    }
    return true;
  }

  const onClickChangePasswordFlag = (value)=>{
    if(!value) {
      setValue("password", "");
      setValue("confirm_password", "");
    }
    setChangePwdFlag(value)
  }


  const submitForm = (data) => {
    const payload = {
      ...data,
      status: data.status ? 1 : 0,
    };
    if(isEdit && !changePwdFlag) {
      delete payload.password
      delete payload.confirm_password
    }
    onSubmit(payload);
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
                { t(`common:form.${isEdit ? "edit" : "create"}`, { field: t('common:form.user') })}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <form>
                <div className="mb-3 username">
                  <label className="form-label required">{t("common:form.username")}</label>
                  <input
                    className={`form-control ${errors.username ? "is-invalid" : ""}`}
                    name="new-username"
                    autoComplete="username"
                    placeholder={t("common:form.username")}
                    {...register("username", { required: true })}
                  />
                  {errors.username && (
                    <small className="text-danger">{t("validation:required-field",{ field: t("common:form.username")})}</small>
                  )}
                </div>
                {
                  isEdit && (
                  <div className="mb-3 change-password-checkbox">
                    <label className="form-label me-2">{t("common:form.change-password")}</label>
                    <input
                      className={`form-check-input`}
                      name="change-password"
                      type="checkbox"
                      value={changePwdFlag}
                      onChange={(e) => onClickChangePasswordFlag(e.target.checked)}
                    />
                  </div>
                  )
                }
                { (!isEdit || changePwdFlag) && (
                  <>
                    <div className="mb-3 password">
                      <label className="form-label required">{t("common:form.password")}</label>

                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${
                            errors.password ? "is-invalid" : ""
                          }`}
                          name="new-password"
                          autoComplete="new-password"
                          placeholder={t("common:form.password")}
                          {...register("password", {
                            validate: (value)=> validatePassword(value)
                          })}
                        />

                        <button
                          type="button"
                          className={`btn btn-outline-secondary ${
                            errors.password ? "border-danger" : ""
                          }`}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                          />
                        </button>
                      </div>

                      {errors.password && (
                        <small className="text-danger d-block mt-1">
                          {errors.password.message}
                        </small>
                      )}
                    </div>
                    <div className="mb-3 confirm-password">
                      <label className="form-label required">
                        {t("common:form.confirm-password")}
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control ${
                            errors.confirm_password ? "is-invalid" : ""
                          }`}
                          name="new-password"
                          autoComplete="new-password"
                          placeholder={t("common:form.confirm-password")}
                          {...register("confirm_password", {
                            validate: (value)=> validateConfirmPassword(value),
                          })}
                        />

                        <button
                          type="button"
                          className={`btn btn-outline-secondary ${
                            errors.confirm_password ? "border-danger" : ""
                          }`}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          <FontAwesomeIcon
                            icon={showConfirmPassword ? faEyeSlash : faEye}
                          />
                        </button>
                      </div>

                      {errors.confirm_password && (
                        <small className="text-danger d-block mt-1">
                          { errors.confirm_password.message }
                        </small>
                      )}
                    </div>
                  </>
                )}

                <div className="mb-3 first-name">
                  <label className="form-label required">{t("common:form.first-name")}</label>
                  <input
                    className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                    placeholder={t("common:form.first-name")}
                    {...register("first_name", { required: true })}
                  />
                  {errors.first_name && (
                    <small className="text-danger">
                      {t("validation:required-field", { field:t("common:form.first-name")})}
                    </small>
                  )}
                </div>

                <div className="mb-3 last-name">
                  <label className="form-label required">{ t("common:form.last-name") }</label>
                  <input
                    className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
                    placeholder={t("common:form.last-name")}
                    {...register("last_name", { required: true })}
                  />
                  {errors.last_name && (
                    <small className="text-danger">
                      {t("validation:required-field", { field:t("common:form.last-name")})}
                    </small>
                  )}
                </div>

                <div className="mb-3 email">
                  <label className="form-label required">{t("common:form.email")}</label>
                  <input
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    type="email"
                    placeholder={t("common:form.email")}
                    {...register("email", { required: true })}
                  />
                  {errors.email && (
                    <small className="text-danger">
                      {t("validation:required-field", { field:t("common:form.email")})}
                    </small>
                  )}
                </div>

                <div className="mb-3 employed-date">
                  <label className="form-label required">{t("common:form.employed-date")}</label>

                  <div>
                    <Controller
                      name="employed_at"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select employed date"
                          className={`form-control ${
                            errors.employed_at ? "is-invalid" : ""
                          }`}
                          wrapperClassName="w-100"
                          maxDate={new Date()}
                        />
                      )}
                    />
                  </div>

                  {errors.employed_at && (
                    <small className="text-danger d-block mt-1">
                      {t("validation:required-field", { field:t("common:form.employed-date")})}
                    </small>
                  )}
                </div>

                <div className="mb-3 role-transfer">
                  <label className="form-label required">{t("common:form.role")}</label>
                  <Controller
                    name="role_ids"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TransferList
                        label={"name"}
                        options={roles || []}
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.role_ids && (
                    <small className="text-danger">
                      {t("validation:required-field", { field:t("common:form.role")})}
                    </small>
                  )}
                </div>

                <div className="mb-3 status">
                  <label className="form-label">{ t("common:form.status") }</label>
                  <div className="form-check form-switch">
                    <input
                      className={`form-check-input`}
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
                    <small className="text-danger">{t("validation:required-field", { field:t("common:form.status")})}</small>
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
                { loading && <span className="spinner-border text-light spinner-border-sm me-2"></span>}
                { t(`common:button.${isEdit ? 'save' : 'create'}`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
