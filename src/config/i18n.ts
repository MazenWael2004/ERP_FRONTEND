import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import ar from "../locales/ar.json";

export const LANGUAGE_STORAGE_KEY = "app-language";
export const DEFAULT_LANGUAGE = "en";

const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
const initialLanguage = savedLanguage === "ar" || savedLanguage === "en"
    ? savedLanguage
    : DEFAULT_LANGUAGE;

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en
            },
            ar: {
                translation: ar
            }
        },

        lng: initialLanguage,

        fallbackLng: "en",

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
