import { useRef } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import DataTable from "@/components/table/DataTable";
import PropTypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";
import { useMemo } from "react";
import { config } from "@/config/config";
import { useTranslation } from "react-i18next";

LeaveUploadFile.propTypes = {
  data: PropTypes.array,
  maximumFile: PropTypes.number,
  onFileChanged: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  pErrors: PropTypes.object,
};

export default function LeaveUploadFile({
  data = [],
  maximumFile = 1,
  onFileChanged = () => {},
  disabled = false,
  required = false,
  pErrors = {},
}) {
  const fileUploadInput = useRef(null);
  const { control, register, watch } = useForm({
    defaultValues: { fileList: data || [] },
  });

  const { t } = useTranslation();
  const { append, remove } = useFieldArray({
    control,
    name: "fileList",
  });

  const fileList = watch("fileList");

  const validateFileSizeAndType = (file, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
     const allowedTypes = [
      // pdf
      "application/pdf",

      // word
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      // excel
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      // powerpoint
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (file.size > maxSizeBytes) {
      toast.error(`File "${file.name}" has over ${maxSizeMB} MB`);
      return false;
    }
    if (!file.type.startsWith("image/") && !allowedTypes.includes(file.type)) {
      toast.error(`Support image, pdf and office`);
      return false;
    }

    return true;
  };


  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // if (files.[0])
    const validFiles = files.filter((file) => validateFileSizeAndType(file));

    if (validFiles) console.log("validFiles :", validFiles);

    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
    e.target.value = null;
  };

  const uploadFiles = async (filesToUpload) => {
    try {
      const formData = new FormData();
      const file = filesToUpload[0];
      formData.append("file", file);
      remove();
      const mockResp = {
        id: Date.now(),
        name: file.name,
        description: "",
        path: URL.createObjectURL(file),
        isNew: true,
      };
      append(mockResp);
      onFileChanged(formData, mockResp.path);
      console.log("Upload file successfully");
    } catch (e) {
      console.log("e :", e);
      console.log("Upload file failed");
    }
  };

  const handleDeleteFile = (index) => {
    remove(index);
    toast.success("Delete file success");
  };

  const columns = useMemo(() => getFileColumn({ t }), [register]);

  return (
    <div className="upload">
      {/* upload part */}
      <div className="mb-3">
        <input
          type="file"
          ref={fileUploadInput}
          accept=".doc,.docx,.pdf,image/*"
          onChange={handleFileChange}
          multiple={false}
          hidden
        />

        <label className={`d-block form-label ${required ? "required" : ""}`}>
          {t("common:form.attachment")}
        </label>

        <button
          className="btn"
          onClick={() => fileUploadInput.current.click()}
          disabled={disabled}
          type="button"
        >
          <FontAwesomeIcon icon={faCloudArrowUp} />
        </button>
        {pErrors && required && data.length === 0 && (
          <>
            <br />
            <small className="text-danger">
              {t("validation:required-field", {
                field: t("common:form.attachment"),
              })}
            </small>
          </>
        )}
        <p className="mt-2 text-muted small user-select-none">
          {t("common:label.attachment-support")} <br />(
          {t("common:label.file-maximum", { maximumFile })})
        </p>
      </div>
      {/* table item uploaded */}
      <DataTable data={fileList} columns={columns} loading={false} />
    </div>
  );
}

const getFileColumn = ({ t }) => [
  {
    header: "#",
    id: "no",
    cell: ({ row }) => row.index + 1,
  },
  {
    header: t("common:form.file-name"),
    id: "name",
    cell: ({ row }) => (
      <a href={getUrl(row)} target="_blank" rel="noopener noreferrer">
        {row.original.name}
      </a>
    ),
  },
];

const getUrl = (row) => {
  if (row.original.isNew) {
    return row.original.path;
  } else {
    return `${config.apiBaseURL}/${row.original.path}`;
  }
};
