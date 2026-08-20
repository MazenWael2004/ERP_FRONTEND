import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../../config/i18n";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isArabic = (i18n.resolvedLanguage ?? i18n.language) === "ar";
  const nextLanguage = isArabic ? "en" : "ar";

  const toggleLanguage = async () => {
    await i18n.changeLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  return (
    <button
      type="button"
      className="language-switcher-button"
      onClick={(event) => {
        event.stopPropagation();
        void toggleLanguage();
      }}
      aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
      title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
    >
      {isArabic ? "English" : "العربية"}
    </button>
  );
}
