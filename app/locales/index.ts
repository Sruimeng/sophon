import en_common from './en/common.json';
import es_common from './es/common.json';
import ja_common from './ja/common.json';
import ko_common from './ko/common.json';
import pt_common from './pt/common.json';
import ru_common from './ru/common.json';
import zh_common from './zh/common.json';

export const Lngs = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'ko', label: '한국어' },
  { code: 'ru', label: 'Русский' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
];

export const I18nConfig = {
  supportedLngs: Lngs.map((item) => item.code),
  fallbackLng: 'en',
  defaultNS: 'common',
  react: {
    useSuspense: false,
  },
};

export const resources = {
  en: {
    common: en_common,
  },
  zh: {
    common: zh_common,
  },
  ja: {
    common: ja_common,
  },
  es: {
    common: es_common,
  },
  pt: {
    common: pt_common,
  },
  ko: {
    common: ko_common,
  },
  ru: {
    common: ru_common,
  },
};

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
  }
}
