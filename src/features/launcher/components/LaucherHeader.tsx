import React from 'react';
import notificationIcon from '../../../assets/images/logos/notification.png';
import logOutIcon from '../../../assets/images/logos/logout.png';
import profileIcon from '../../../assets/images/logos/profile.png';
import companyLogoIcon from '../../../assets/images/logos/b_connect_egypt_logo-removebg-preview.png';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from 'src/components/provider/theme-provider';
import nightLogo from '../../../assets/images/logos/night-mode.png';
import nightLogo2 from '../../../assets/images/logos/night-mode (1).png';
import Swal from 'sweetalert2';

function LauncherHeader({ name, role }: any) {
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { logout } = useAuth();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: t("LOGOUT"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t("YES"),
      cancelButtonText: t("NO"),
    });

    if (!result.isConfirmed) return;

    try {
      await Swal.fire({
        title: t("LOGGED_OUT_SUCCESSFULLY"),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      logout();
    } catch (error) {
      console.error('Failed to log out:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to log out',
        icon: 'error',
      });
    }
  };

  return (
    <div className={`launcher-header-container ${isArabic ? 'rtl-header' : 'ltr-header'}`}>
      <div className="header-content">
        <div className="header-log-out">
          <img src={logOutIcon} style={{ width: 25, height: 25 }} alt="" onClick={handleLogout} />
         
        </div>
        <div className="header-notification">
          <img src={notificationIcon} style={{ width: 25, height: 25 }} alt="" />
        </div>
        <div className={`header-profile ${isArabic ? 'rtl-header' : 'ltr-header'}`}>
          <div className="profile-picture">
            <img src={profileIcon} alt="" />
          </div>
          <div className="header-profile-description">
            <p className="profile-name">{name}</p>
            <p className="profile-role">{role}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
        {theme === 'light' ? (
          <button onClick={() => setTheme('dark')}>
            <img src={nightLogo} alt="Night Mode" style={{ width: 50, height: 50 }} />
          </button>
        ) : (
          <button onClick={() => setTheme('light')}>
            <img src={nightLogo2} alt="Light Mode" style={{ width: 50, height: 50 }} />
          </button>
        )}

        <img src={companyLogoIcon} style={{ width: 80, height: 80 }} alt="" />
      </div>
    </div>
  );
}

export default LauncherHeader;
