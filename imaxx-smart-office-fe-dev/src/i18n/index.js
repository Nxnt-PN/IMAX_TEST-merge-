// src/i18n/index.js
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// EN
import enCommon from "./locales/en/common.json"
import enValidation from "./locales/en/validation.json"

// TH
import thCommon from "./locales/th/common.json"
import thValidation from "./locales/th/validation.json"

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        validation: enValidation,
      },
      th: {
        common: thCommon,
        validation: thValidation,
      }
    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "validation"],
    interpolation: { escapeValue: false }
  })

export default i18n
