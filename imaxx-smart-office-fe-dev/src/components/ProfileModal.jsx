import {
  changeMyPassword,
  changeMyProfilePicture,
  getMyInfo,
  selectLoading,
  selectMyInfo
} from "@/stores/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "@/components/table/DataTable";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ProfileUploader from "@/components/ProfileUploader";




const showChangePassword = async (dispatch, t) => {
  const { value: formValues } = await Swal.fire({
    title: t("common:form.change-password"),
    html: `
      <hr class="mb-5 mt-0">
      <input id="swal-pwd" type="password" class="form-control mb-2" placeholder="${t("common:form.password")}">
      <input id="swal-confirm" type="password" class="form-control mb-2" placeholder="${t("common:form.confirm-password")}">
      `,
    buttonsStyling: false, // disable SweetAlert default button style
    inputClass: "form-control",
    customClass: {
      header: "border-bottom pb-2 mb-3",
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-outline-secondary",
      title: "fs-5 fw-semi-bold text-start",
      actions: "d-flex justify-content-between w-100 px-3"
    },
    reverseButtons: true,
    showCancelButton: true,
    confirmButtonText: t("common:action.save"),
    cancelButtonText: t("common:action.cancel"),
    focusConfirm: false,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: () => !Swal.isLoading(),
    preConfirm: async () => {
      try {
        const pwd = document.getElementById("swal-pwd").value;
        const confirmPwd = document.getElementById("swal-confirm").value;
        if (!pwd) {
          Swal.showValidationMessage(t("validation:required-field",{field: t("common:form.password")}));
          return false;
        }
        if (!confirmPwd) {
          Swal.showValidationMessage(t("validation:required-field",{field: t("common:form.confirm-password")}));
          return false;
        }

        if (pwd !== confirmPwd) {
          Swal.showValidationMessage(t("validation:field-not-match",{field: t("common:form.password")}));
          return false;
        }
        if(pwd) {
          await dispatch(changeMyPassword({ password: pwd })).unwrap();
        }
        toast.success(t("common:label.change-password-success"));
      } catch (error) {
        toast.error(error.message || "Change Password Failed");
      }
    },
  });

};

const roleColumns = ({ t }) => [
  {
    header: "#",
    accessorKey: "no",
    cell: ({ row }) => <div className="no-column table">{row.index + 1}</div>,
  },
  {
    header: t("common:form.role"),
    accessorKey: "role",
    cell: ({ row }) => (
      <div className="name-column table">{row.original.name}</div>
    ),
  },
  {
    header: t("common:form.permission"),
    accessorKey: "permission",
    cell: ({ row }) => (
      <div className="permission-column table">
        {row.original.permissions.map((p) => (
          <span className="badge info me-2" key={p.id}>
            {p.name}
          </span>
        ))}
      </div>
    ),
  },
];


const onSave = async ({dispatch, formData, onClose}) => {
    try {
      // save profile picture
      await dispatch(changeMyProfilePicture(formData)).unwrap();
      toast.success("Save profile success");
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.log('error :', error);
      toast.error("Failed to save profile");
    }
  }

  const onFileChange = ({formData, setFile}) => {
    setFile(formData);
  }



ProfileModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
};

export default function ProfileModal({ open, onClose, initialData }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const userData = useSelector(selectMyInfo);
  const loading = useSelector(selectLoading);
  const roles = userData?.roles || [];
  const fullName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();

  useEffect(() => {
    if (open) {
      dispatch(getMyInfo()).unwrap()
    }
  }, [open, dispatch])


  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                {t("common:titles.my-profile.name")}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="d-flex gap-5 align-items-center mb-3">
                <ProfileUploader name={fullName} filePath={userData?.avatar_path} onFileChanged={(formData) => onFileChange({formData, setFile})} />
                <div className="profile-content d-flex flex-column gap-0">
                  <div className="d-flex gap-2  username">
                    <div className="profile-key ">
                      {t("common:form.username")} :
                    </div>
                    <div className="profile-value">{userData?.username}</div>
                  </div>
                  <div className="d-flex gap-2  username">
                    <div className="profile-key ">
                      {t("common:form.name")} :
                    </div>
                    <div className="profile-value">{`${userData?.first_name} ${userData?.last_name}`}</div>
                  </div>
                  <div className="d-flex gap-2  username">
                    <div className="profile-key ">
                      {t("common:form.email")} :
                    </div>
                    <div className="profile-value">{userData?.email}</div>
                  </div>
                  <button className="d-flex gap-2  change-password change-password-link" href="#" onClick={() => showChangePassword(dispatch, t)}>
                      {t("common:form.change-password")}
                  </button>
                </div>
              </div>
              {/* Roles */}
              <div className="roles-table">
                <DataTable
                  data={roles}
                  columns={roleColumns({ t })}
                  loading={false}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary " onClick={onClose}>
                {t("common:button.close")}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => onSave({ dispatch, formData: file, onClose })} disabled={loading}>
                {t("common:button.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
