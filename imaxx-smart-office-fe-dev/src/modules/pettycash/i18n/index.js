import { useEffect, useState } from 'react'
import th from './th'
import en from './en'

const dictionaries = { th, en }
const storageKey = 'language'

export const getLanguage = () => localStorage.getItem(storageKey) || 'th'

export const setLanguage = (language) => {
  const nextLanguage = dictionaries[language] ? language : 'th'
  localStorage.setItem(storageKey, nextLanguage)
  window.dispatchEvent(new CustomEvent('languagechange', { detail: nextLanguage }))
}

export const translate = (language, key, params = {}) => {
  const template = dictionaries[language]?.[key] || dictionaries.th[key] || key
  return Object.entries(params).reduce(
    (value, [name, replacement]) => value.replaceAll(`{{${name}}}`, replacement ?? ''),
    template,
  )
}

export const translateStatus = (language, status) => {
  const value = String(status || '')
  const normalized = value.toLowerCase()
  const key = `status.${normalized}`
  return dictionaries[language]?.[key] || dictionaries.th[key] || value
}

export const translateAction = (language, action) => {
  const normalized = String(action || '').toLowerCase()
  return translate(language, `action.${normalized}`) || action
}

export function useI18n() {
  const [language, setCurrentLanguage] = useState(getLanguage)

  useEffect(() => {
    const handleChange = () => setCurrentLanguage(getLanguage())
    window.addEventListener('languagechange', handleChange)
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener('languagechange', handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  return {
    language,
    setLanguage,
    t: (key, params) => translate(language, key, params),
    tStatus: (status) => translateStatus(language, status),
    tAction: (action) => translateAction(language, action),
  }
}
