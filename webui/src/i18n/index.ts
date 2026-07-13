import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 中文翻译
import zhCommon from './locales/zh-CN/common.json'
import zhConfig from './locales/zh-CN/config.json'
import zhTerminal from './locales/zh-CN/terminal.json'
import zhData from './locales/zh-CN/data.json'
import zhEnv from './locales/zh-CN/env.json'
import zhLicense from './locales/zh-CN/license.json'

// 英文翻译
import enCommon from './locales/en-US/common.json'
import enConfig from './locales/en-US/config.json'
import enTerminal from './locales/en-US/terminal.json'
import enData from './locales/en-US/data.json'
import enEnv from './locales/en-US/env.json'
import enLicense from './locales/en-US/license.json'

const resources = {
  'zh-CN': {
    common: zhCommon,
    config: zhConfig,
    terminal: zhTerminal,
    data: zhData,
    env: zhEnv,
    license: zhLicense,
  },
  'en-US': {
    common: enCommon,
    config: enConfig,
    terminal: enTerminal,
    data: enData,
    env: enEnv,
    license: enLicense,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    supportedLngs: ['zh-CN', 'en-US'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mediacrawler_language',
    },
  })

// 语言检测后处理：非英文一律显示中文
i18n.on('languageChanged', (lng) => {
  if (lng && !lng.startsWith('en') && i18n.language !== 'zh-CN') {
    i18n.changeLanguage('zh-CN')
  }
})

// 初始化时强制：除非用户明确存了 en，否则用中文
const savedLang = localStorage.getItem('mediacrawler_language')
if (!savedLang || !savedLang.startsWith('en')) {
  i18n.changeLanguage('zh-CN')
}

export default i18n
