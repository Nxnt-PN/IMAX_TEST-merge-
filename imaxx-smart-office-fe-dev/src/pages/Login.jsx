import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/stores/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // redux state
  const { loading, error } = useSelector((state) => state.auth);

  // local state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [ showPassword, setShowPassword ] = useState(false);
  const onLogin = (e) => {
    e.preventDefault();
    if(loading) return;

    const errorObj = { username: "", password: "" };
    let hasError = false;

    if (!username) {
      errorObj.username = t("validation:required-field", { field: t("common:form.username") });
;
      hasError = true;
    }
    if (!password) {
      errorObj.password = t("validation:required-field", { field: t("common:form.password") });
      hasError = true;
    }

    setErrors(errorObj);
    if (hasError) return;
    dispatch(loginUser({ username, password }))
      .unwrap()
      .then(() => {
        navigate("/")
        toast.success("Login successfully");
      })
      .catch((error) => {
        console.log("Login failed:", error);
      });
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="login-container row w-100 justify-content-center">

        {/* ===== Left: Branding ===== */}
        <div className="col-md-5 d-none d-md-flex flex-column justify-content-center pe-5">
          <h2 className="fw-bold mb-2">
            <span className="text-primary">iMAXX</span> Solution
          </h2>
          <p className="fs-5 text-muted">Smart Office</p>
          <p className="text-muted mt-3">
            { t("common:label.web-quote-1")}<br />
            { t("common:label.web-quote-2")}
          </p>
        </div>

        {/* ===== Right: Login Card ===== */}
        <div className="col-md-4 col-sm-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">

              <h4 className="fw-bold mb-1">{ t("common:titles.login.name")}</h4>
              <p className="text-muted mb-4 fs-14">
                { t("common:titles.login.subtitle")}
              </p>

              {error && (
                <div className="alert alert-danger py-2">
                  {error}
                </div>
              )}

              <form onSubmit={onLogin}>
                {/* Username */}
                <div className="mb-3">
                  <label className="form-label">{ t("common:form.username")}</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? "is-invalid" : ""}`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={ t("common:form.username")}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label">{ t("common:form.password")}</label>
                  <div className="input-group">
                    <input
                      type={showPassword ?'text':'password'}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      value={password}
                      placeholder={ t("common:form.password")}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button" onClick={()=>setShowPassword(!showPassword)} ><FontAwesomeIcon icon={showPassword ? faEye: faEyeSlash} /></button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      { t("common:label.login")}...
                    </>
                  ) : (
                    <span>{ t("common:label.login")}</span>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
