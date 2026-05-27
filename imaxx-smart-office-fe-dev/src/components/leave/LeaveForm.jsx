import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faPaperPlane,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";
import {
  LEAVE_STATE,
  LEAVE_TYPE,
} from "@/constants/leaveRequest/leaveRequestEnum";
import {
  leaveStateBadge,
  getAllLeaveTypeOptions,
} from "@/constants/leaveRequest/leaveRequestOptions";
import { LEAVE_STATE_LABEL } from "@/constants/leaveRequest/leaveRequestLabel";
import ResponsiveDatePicker from "@/components/ResponsiveDatePicker";
import Swal from "sweetalert2";
import LeaveUploadFile from "./LeaveUploadFile";
import { faCancel } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import Can from "@/components/Can";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { milliseconds } from "date-fns";

LeaveForm.propTypes = {
  data: PropTypes.array,
  mode: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  element: PropTypes.string,
  onFileChanged: PropTypes.func,
  PERMISSION: PropTypes.object,
  authPermissions: PropTypes.array,
  loading: PropTypes.bool,
};


export default function LeaveForm({
  data,
  mode = "view", // view | edit | approve
  onSubmit,
  onClose,
  element,
  onFileChanged,
  PERMISSION = {},
  authPermissions = [],
  loading = false,
}) {
  const { t, i18n } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(null);

  const isEditable = mode === "edit";
  const isApproveMode = mode === "approve";
  const isViewMode = mode === "view";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues,
  } = useForm({
    defaultValues: {
      leave_type: data?.leave_type || "",
      start_date: data?.startDate || null,
      end_date: data?.endDate || null,
      reason: data?.reason || null,
      total_days: data?.total_days ? data.total_days : 0,
      state: data?.state || LEAVE_STATE.DRAFT,
      file_path: data?.file_path || null,
    },
  });


  const currentState = watch("state");
  const currentStartDate = watch("start_date");
  const currentEndDate = watch("end_date");
  const currentLeaveType = watch("leave_type");
  const currentTotalDays = watch("total_days")

  useEffect(() => {
    reset({
      leave_type: data?.leave_type || "",
      start_date: data?.start_date || null,
      end_date: data?.end_date || null,
      reason: data?.reason || null,
      total_days: data?.total_days ? data.total_days : 0,
      state: data?.state || LEAVE_STATE.DRAFT,
      file_path: data?.file_path || null,
    });
  }, [data, reset]);

  useEffect(() => {
    const days = calculateDays();
    setValue("total_days", days);
  }, [currentStartDate, currentEndDate]);

  // ======================== Functions ======================

  const calculateDays = () => {
    // when not selected date yet
    if (!currentStartDate || !currentEndDate) {
      return "";
    }
    if(currentTotalDays && isViewMode) {
      return currentTotalDays;
    }
    // if same day
    if (moment(currentEndDate).isSame(currentStartDate, "day")) {
      const calHours = moment(currentEndDate).diff(currentStartDate, "hours");
      if (calHours === 9) {
        return 1;
      } else if (
        (calHours === 3 || calHours === 4) &&
        (
          moment(currentStartDate).format("HH:mm") === "09:00" &&
          (moment(currentEndDate).format("HH:mm") === "12:00" || moment(currentEndDate).format("HH:mm") === "13:00")
        )
      ) {
        return 0.5;
      } else if (
        (calHours === 5 || calHours === 6) &&
        (
          (moment(currentStartDate).format("HH:mm") === "12:00" || moment(currentStartDate).format("HH:mm") === "13:00") &&
          moment(currentEndDate).format("HH:mm") === "18:00"
        )
      ) {
        return 0.5;
      }
    }
    // if greater than 1 day
    else {
      // get range not include startDate and endDate
      const rangeList = [];
      let current = moment(currentStartDate).add(1, "days");
      while (current.isBefore(currentEndDate, "day")) {
        if (isWeekday(current.toDate())) {
          rangeList.push(current.format("YYYY-MM-DD"));
        }
        current.add(1, "days");
      }
      // startDate check hours
      let daysCal = rangeList?.length || 0;
      const startDateHours = moment(getMaxTime(currentStartDate)).diff(
        currentStartDate,
        "hours",
      );
      // full day
      if (startDateHours === 9) {
        daysCal += 1;
        // 13:00 - 18:00
      } else if (startDateHours === 5 || startDateHours === 6) {
        daysCal += 0.5;
        // 9:00 - 12:00
      } else if (startDateHours === 3 || startDateHours === 4) {
        daysCal += 0.5;
      }
      // endDate check hours
      const endDateHours = moment(getMaxTime(currentEndDate)).diff(
        currentEndDate,
        "hours",
      );
      // full day
      const remainingHours = 9 - endDateHours;
      if (remainingHours === 9) {
        daysCal += 1;
        // 13:00 - 18:00
      } else if (remainingHours === 5 || remainingHours === 6) {
        daysCal += 0.5;
        // 9:00 - 12:00
      } else if (remainingHours === 3 || remainingHours === 4) {
        daysCal += 0.5;
      }
      return daysCal;
    }
    return 0;
  };

  const getMinDate = (date) =>{
    let minDate = moment(date);
    if(currentLeaveType === LEAVE_TYPE.SICK){
      minDate = moment(date).subtract(7, 'days');
    }
    return moment(minDate).set({ hour: 9, minute: 0, second: 0 }).toDate();
  }

  const getMinTime = (date) =>{
    return moment(date).set({ hour: 9, minute: 0, second: 0 }).toDate();
  }

  const getMaxTime = (date) =>
    moment(date).set({ hour: 18, minute: 0, second: 0 }).toDate();


  const getMinTimeEndDate = (date) =>{
    return moment(date).set({ hour: 9, minute: 30, second: 0 }).toDate();
  }

  const getMaxTimeEndDate = (date) =>
    moment(date).set({ hour: 18, minute: 0, second: 0 }).toDate();

  const submitForm = async (formData, action) => {
    setLoadingAction(action);
    const result = await Swal.fire({
      title: t("common:label.confirm", {
        action: t(`common:action.${action}`),
      }),
      text: t("common:label.confirm-subtitle"),
      icon: "warning",
      input: "text",
      inputPlaceholder: t("common:placeholder.confirm-remark"),
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: t("common:button.confirm"),
      cancelButtonText: t("common:button.cancel"),
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      onSubmit({
        ...data,
        ...formData,
        action,
        remark: result.value,
      });
    }
  };

  const disabledUpload = () => {
    return !isRequired();
  };

  const requiredUpload = () => {
    if (!isRequired()) {
      return false;
    }
    if (!currentStartDate || !currentEndDate) {
      return false;
    }
    return getValues("total_days") >= 2 && currentLeaveType === LEAVE_TYPE.SICK;
  };

  // filter weekend such as saturday and sunday
  const isWeekday = (date) => {
    if (!(date instanceof Date)) return true;
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const startDateValidate = (value, formValue) => {
    // not validate when state is greater than draft
    if (currentState > LEAVE_STATE.DRAFT) {
      return true;
    }

    // validate required start date
    if (!value) {
      return t("validation:required-field", {
        field: t("common:form.start-date"),
      });
    }

    // validate is weekend
    if (!isWeekday(moment(value).toDate())) {
      return t("validation:weekend-day");
    }

    const startDate = moment(value);
    const endDate = formValue.end_date ? moment(formValue.end_date) : null;

    // validate start date same or after endDate
    // if (endDate && startDate.isSameOrAfter(endDate)) {
    //   return t("validation:date-range-invalid");
    // }

    // validate startDate has startTime is in range of  9:00 - 18: 00
    const startWorkTimeUnix = moment(getMinTime(startDate)).unix();
    const endWorkTimeUnix = moment(getMaxTime(startDate)).unix();
    const startDateUnix = startDate.unix();
    if (startDateUnix < startWorkTimeUnix || startDateUnix > endWorkTimeUnix) {
      return t("validation:invalid-time");
    }

    // validate is not sick leave before 7 days (ไม่ใช่ลาป่วย ต้องลาก่อน 7 วัน)
    // [ ANNUAL, ABSENCE, OTHER ]
    if (
      currentLeaveType !== LEAVE_TYPE.SICK &&
      (startDate.isSameOrBefore(moment().format()) ||
        moment(startDate).diff(moment().format(), "days") < 7)
    ) {
      const dateEn = moment().add(8, "d").format("Do");
      const dateTh = moment().add(8, "d").format("DD");
      return t("validation:leave-in-advance", { date: dateEn, dateTh });
    }

    return true;
  };

  const endDateValidate = (value, formValue) => {
    // not validate when state is greater than draft
    if (currentState > LEAVE_STATE.DRAFT) {
      return true;
    }

    if (!value) {
      return t("validation:required-field", {
        field: t("common:form.end-date"),
      });
    }

    // validate is weekend
    if (!isWeekday(moment(value).toDate())) {
      return t("validation:weekend-day");
    }

    const endDate = moment(value);
    const startDate = formValue.start_date
      ? moment(formValue.start_date)
      : null;

    // validate startDate has startTime is in range of  9:00 - 18:00
    const startWorkTimeUnix = moment(getMinTime(endDate)).unix();
    const endWorkTimeUnix = moment(getMaxTime(endDate)).unix();
    const endDateUnix = endDate.unix();
    if (endDateUnix < startWorkTimeUnix || endDateUnix > endWorkTimeUnix) {
      return t("validation:invalid-time");
    }

    // validate end date same or after startDate
    if (startDate && endDate.isSameOrBefore(startDate)) {
      return t("validation:date-range-invalid");
    }

    return true;
  };

  const getFileUpload = () => {
    if (data?.file_path) {
      const pathSplit = data.file_path.split("/");
      return [
        {
          id: Date.now() + 1,
          name: pathSplit?.[3] ? pathSplit?.[3] : pathSplit?.[2],
          path: data.file_path,
          isNew: false,
        },
      ];
    }
    return [];
  };

  const onUpload = async (formData, path) => {
    setValue("file_path", path, { shouldValidate: true });
    await onFileChanged(formData);
  };

  const isRequired = () => {
    return currentState === 1 && isEditable;
  };

  const getTitle = () => {
    return data?.id ? t("common:label.leave-request") : t("common:form.new", { field: t("common:label.leave-request") });
  };

  const getSubtitle = () => {
    const name =
      data?.user?.first_name && data?.user?.last_name
        ? `${data.user.first_name} ${data.user.last_name}`
        : ``;
    return `${name}`;
  };

  const getDetails = (detail) => {
    const action = detail.action;
    if (detail) {
      let act = "";
      if (action === "DRAFT") {
        act = t('common:action.save');
      } else {
        act = action.toLowerCase()
        act = t(`common:action.${act}`) || act;
      }
      return {
        action: act,
        name:
          detail?.created_user?.first_name && detail?.created_user?.last_name
            ? `${detail.created_user.first_name} ${detail.created_user.last_name}`
            : "name",
        dateTime: detail?.created_at
          ? moment.parseZone(detail?.created_at).format("DD/MM/YYYY (HH:mm)")
          : "",
      };
    }
    return {
      name: " ",
      date: " ",
    };
  };

  const getHistories = ()=>{
    if(!data?.leave_form_histories.length) return []
    // clone before reverse object array
    const histories = [...data.leave_form_histories]
    return histories.toReversed() || []
  }

  return (
    <>
      {/* ===== Header ===== */}
      <div className="modal-header">
        <div className="d-flex align-items-center">
          <div className="me-2 mb-0">
            <h6 className="mb-1 me-2">{getTitle()}</h6>
            <small className="text-muted me-2"> {getSubtitle()}</small>
            <span className={leaveStateBadge(currentState)}>
              { t(`common:leave-state.${LEAVE_STATE_LABEL[currentState]}`) }
            </span>
          </div>
        </div>

        {onClose && element === "modal" && (
          <button type="button" className="btn-close " onClick={onClose} />
        )}
      </div>

      {/* ===== Leave Info ===== */}
      <div className="modal-body">
        <form>
          <div className="row my-2" key={isRequired()}>
            {/* Type */}
            <div className="col-12">
              <label className={`form-label ${isRequired() ? "required" : ""}`}>
                {t("common:form.type")}
              </label>
              <select
                className={`form-select ${errors?.leave_type ? "is-invalid" : ""}`}
                name="leave_type"
                id="leave_type"
                {...register("leave_type", { required: isRequired() })}
                disabled={currentState !== LEAVE_STATE.DRAFT || !isEditable}
              >
                <option value="">{t("common:leave-type.all")}</option>
                {getAllLeaveTypeOptions(t).map((option) => (
                  <option key={option.value} value={option.value}>
                    { option.label }
                  </option>
                ))}
              </select>
              {errors.leave_type && (
                <small className="text-danger">
                  {t("validation:required-field", {
                    field: t("common:form.type"),
                  })}
                </small>
              )}
            </div>
            {/* Start-Date */}
            <div className="col-12 my-2">
              <label className={`form-label ${isRequired() ? "required" : ""}`}>
                {t("common:form.start-date")}
              </label>
              <Controller
                name="start_date"
                control={control}
                rules={{
                  validate: (value, formValue) =>
                    startDateValidate(value, formValue),
                }}
                render={({ field }) => (
                  <ResponsiveDatePicker
                    key={currentLeaveType}
                    value={field.value}
                    onChange={field.onChange}
                    minDate={getMinDate(new Date())}
                    minTime={getMinTime(field.value || new Date())}
                    maxTime={getMaxTime(field.value || new Date())}
                    hasTime
                    filterDate={isWeekday}
                    className={`${errors?.start_date ? "is-invalid" : ""}`}
                    disabled={currentState !== LEAVE_STATE.DRAFT || !isEditable || !getValues("leave_type")}
                  />
                )}
              />
              {errors.start_date && (
                <small className="text-danger">
                  {errors.start_date.message}
                </small>
              )}
            </div>
            {/* End-Date */}
            <div className="col-12 my-2">
              <label className={`form-label ${isRequired() ? "required" : ""}`}>
                {t("common:form.end-date")}
              </label>
              <Controller
                name="end_date"
                control={control}
                rules={{
                  validate: (value, formValue) =>
                    endDateValidate(value, formValue),
                }}
                render={({ field }) => (
                  <ResponsiveDatePicker
                    value={field.value}
                    onChange={(date)=>{
                      if (!date) return;

                      const tmpDate = moment(date).clone();

                      const notSelTime =
                        tmpDate.hour() === 9 && tmpDate.minute() === 30;

                      if (notSelTime) {
                        const newDate = tmpDate
                          .clone()
                          .hour(18)
                          .minute(0)
                          .second(0)
                          .millisecond(0);
                        field.onChange(newDate.toDate());
                        return;
                      }

                      field.onChange(tmpDate.toDate());
                    }}
                    minDate={getValues("start_date") || new Date()}
                    minTime={getMinTimeEndDate(
                      field.value || currentStartDate || new Date(),
                    )}
                    maxTime={getMaxTimeEndDate(
                      field.value || currentStartDate || new Date(),
                    )}
                    hasTime
                    filterDate={isWeekday}
                    disabled={
                      currentState !== LEAVE_STATE.DRAFT ||
                      !isEditable ||
                      !currentStartDate
                    }
                    className={`${errors?.end_date ? "is-invalid" : ""}`}
                  />
                )}
              />
              {errors?.end_date && (
                <small className="text-danger">{errors.end_date.message}</small>
              )}
            </div>
            {/* Days */}
            <div className="col-12 my-2">
              <label className="form-label" id="daysInput">
                {t("common:form.days")}
              </label>
              <input
                className="form-control"
                type="text"
                {...register("total_days")}
                disabled={true}
                id="total_days"
              />
            </div>
            {/* Reason */}
            <div className="col-12 my-2">
              <label className={`form-label ${isRequired() ? "required" : ""}`}>
                {t("common:form.reason")}
              </label>
              <textarea
                className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                rows={3}
                {...register("reason", { required: true })}
                disabled={currentState !== LEAVE_STATE.DRAFT || !isEditable}
              />
              {errors.reason && (
                <small className="text-danger">
                  {t("validation:required-field", {
                    field: t("common:form.reason"),
                  })}
                </small>
              )}
            </div>
          </div>

          {/* file_path for validate */}
          <input
            type="hidden"
            {...register("file_path", {
              validate: (value) => {
                if (!requiredUpload()) return true;
                return !!value || "Upload is required";
              },
            })}
          />

          <LeaveUploadFile
            key={currentState}
            data={getFileUpload()}
            maximumFile={1}
            errors={errors}
            onFileChanged={onUpload}
            disabled={disabledUpload()}
            required={requiredUpload()}
            pErrors={errors.file_path}
          />
        </form>
        {/* ===== Log Info ===== */}
        {
          !!data?.leave_form_histories?.length && (<>
            <hr />
            <span className="fw-semi-bold">{t("common:label.history")} </span>
            <div className="log-history-container">
              { getHistories().map((h)=>(<div key={h.id} className={`log-history-item ${h.action.toLowerCase()}`}>
                <p className="m-0" >
                  {t(`common:label.action-by`, getDetails(h))}
                </p>
                <small>
                  { t('common:form.remark') }: {h?.remark ? `"${h.remark}"` : '-'}
                </small>
              </div>
              ))}
            </div>
          </>)
        }
      </div>
      { ((currentState === LEAVE_STATE.DRAFT && isEditable) ||
        ((currentState === LEAVE_STATE.WAITING_MANAGER && (isEditable || isApproveMode )) ||
              (currentState === LEAVE_STATE.WAITING_HR && (isApproveMode)) ||
              (currentState === LEAVE_STATE.COMPLETE && isViewMode)
            ) ||
            ((currentState === LEAVE_STATE.WAITING_MANAGER || currentState === LEAVE_STATE.WAITING_HR) && isApproveMode )

          ) &&
        <div className={`modal-footer `}>
          <div className=" d-flex justify-content-between  w-100 gap-2">
            {/* Draft */}
            { (currentState === LEAVE_STATE.DRAFT && isEditable) && (
              <>
                <Can
                  required={[PERMISSION.SAVE_LEAVE]}
                  permissions={authPermissions}
                >
                  <button
                    className="btn btn-primary w-50"
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit((data) => submitForm(data, "save"))}
                  >
                    {loadingAction === "save" && loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                    )}{" "}
                    {t("common:button.save")}
                  </button>
                </Can>
                <Can
                  required={[PERMISSION.SUBMIT_LEAVE]}
                  permissions={authPermissions}
                >
                  <button
                    className="btn btn-success w-50"
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit((data) => submitForm(data, "submit"))}
                  >
                    {loadingAction === "submit" && loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                    )}{" "}
                    {t("common:button.submit")}
                  </button>
                </Can>
              </>
            )}
            {/* Cancel */}
            {((currentState === LEAVE_STATE.WAITING_MANAGER && (isEditable || isApproveMode )) ||
              (currentState === LEAVE_STATE.WAITING_HR && (isApproveMode)) ||
              (currentState === LEAVE_STATE.COMPLETE && isViewMode)
            ) &&  (
              <Can
                required={[PERMISSION.CANCEL_LEAVE]}
                permissions={authPermissions}
              >
                <button
                  className="btn btn-danger w-50"
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit((data) => submitForm(data, "cancel"))}
                >
                  {loadingAction === "cancel" && loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <FontAwesomeIcon icon={faCancel} className="me-2" />
                  )}
                  {t("common:button.cancel")}
                </button>
              </Can>
            )}
            {/* Approve */}
            {((currentState === LEAVE_STATE.WAITING_MANAGER || currentState === LEAVE_STATE.WAITING_HR) && isApproveMode )&& (
                <Can
                  required={[PERMISSION.APPROVE_LEAVE]}
                  permissions={authPermissions}
                >
                  <button
                    type="button"
                    className="btn btn-success w-50"
                    onClick={handleSubmit((data) =>
                      submitForm(data, "approve"),
                    )}
                    disabled={loading}
                  >
                    {loadingAction === "approve" && loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
                    )}{" "}
                    {t("common:button.approve")}
                  </button>
                </Can>
            )}
          </div>
      </div>}
    </>
  );
}
