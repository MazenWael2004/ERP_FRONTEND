import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");
  };

  return (
    <button className="language-switcher-button"  onClick={toggleLanguage}>
      {i18n.language === "en" ? "العربية" : "English"}
    </button>
  );
}