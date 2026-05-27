import swal from "sweetalert";

/* ========= API ========= */

export function signUp(username, password) {
  return globalThis.$axios.post("/api/users/signup", {
    username,
    password,
  });
}

export function login(username, password) {
  return globalThis.$axios.post("/api/users/authenticate", {
    username,
    password,
  });
}

export function refreshToken(data) {
  return globalThis.$axios.post("/api/users/refresh-token", {
    token: data.token,
  });
}

/* ========= Helpers ========= */

export function formatError(errorResponse) {
  switch (errorResponse?.error?.message) {
    case "EMAIL_EXISTS":
      swal("Oops", "Email already exists", "error");
      break;
    case "EMAIL_NOT_FOUND":
      swal("Oops", "Email not found", "error", { button: "Try Again!" });
      break;
    case "INVALID_PASSWORD":
      swal("Oops", "Invalid Password", "error", { button: "Try Again!" });
      break;
    // default:
    //   swal("Oops", "Something went wrong", "error");
  }
}

export function saveTokenInLocalStorage(tokenDetails) {
  localStorage.setItem("userDetails", JSON.stringify(tokenDetails));
}

export function clearToken() {
  localStorage.removeItem("userDetails");
}

export function getStoredUser() {
  const data = localStorage.getItem("userDetails");
  return data ? JSON.parse(data) : null;
}

export function isLogin() {
  return !!localStorage.getItem("userDetails");
}

export function changeMyPassword (payload) {
  return globalThis.$axios.patch("/api/users/me/password", payload);
}

export function changeMyProfilePicture (formData) {
  return globalThis.$axios.patch("/api/users/me/upload-profile", formData, { headers: { "Content-Type": "multipart/form-data" } },);
}

export function getMyInfo () {
  return globalThis.$axios.get("/api/users/me");
}
