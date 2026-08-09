import React from 'react'
import LauncherHeader from '../components/LaucherHeader'
import LauncherContent from '../components/LauncherContent'
import { useAuth } from '../../auth/hooks/useAuth'
import { useTranslation } from 'react-i18next'

// import { decodeToken } from "../../../shared/auth/token";

// const decoded = decodeToken();


function LauncherPage() {
  // console.log(decoded);
  const {user} = useAuth();
  const { i18n, t } = useTranslation();
    const isArabic = i18n.language === "ar";
  console.log(user);
  return (
    <div>
    <LauncherHeader name={isArabic?user?.name_ar:user?.name_en} role={'role'} /> {/*? means that it can be null */}
    <LauncherContent />
    </div>
  )
}

export default LauncherPage