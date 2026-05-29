// check one permissions for one permission required
export const hasPermission = (permissions, permission) =>
  permissions.includes(permission);
// check all permission required
export const hasAllPermissions = (permissions, required) =>
  required.every((r) => permissions.includes(r));
// check any permission required
export const hasAnyPermission = (permissions, required) =>
  required.some((r) => permissions.includes(r));

export const saveTranslationToLocalStorage = (lang) => {
  localStorage.setItem("language", lang);
  window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
};
export const getTranslationFromLocalStorage = () => localStorage.getItem("language");
