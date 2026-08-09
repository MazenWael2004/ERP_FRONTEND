import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import companyLogoIcon from '../../../assets/images/logos/b_connect_egypt_logo-removebg-preview.png';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginSchema } from '../validation';
import { loginApi } from '../authService';
import axios from 'axios';
import Spinner from '../../../shared/components/Spinner';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

function LoginPage() {
  // for toggling translation/ language...
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  // We used react-hook-form to pass
  // React Hook Form is a library that makes handling forms in React much easier and more performant.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await loginApi(data); // call the api auth Service
      login(result.data, result.token);

      // Save token, navigate, etc.
      await Swal.fire({
        icon: 'success',
        title: t('LOGIN_SUCCESSFUL'),
      });
      nav('/desk');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: t(error.response?.data.error.message),
            confirmButtonText: t('OK'),
          });
          console.log(error.response?.data);
        } else {
          console.log(error.response?.data);
        }
      } else {
        console.log('Unexpected error');
      }
    } finally {
      // this block is executed whether request succeeds or fails
      setIsLoading(false);
    }
  };

  return (
    <div className={`login-container ${isArabic ? 'rtl-header' : 'ltr-header'}`}>
      <div className="second-half-container">
        <div className="company-logo">
          <img src={companyLogoIcon} alt="B-Connect" style={{ width: 100, height: 100 }} />
        </div>
        <h2>{t('WELCOME_MESSAGE')}</h2>
        <form className="login-form-container" onSubmit={handleSubmit(onSubmit)}>
          <p className="login-subtitle">{t('SIGN_IN_MESSAGE')}</p>
          <div className={`form-group ${isArabic ? 'rtl-header' : 'ltr-header'}`}>
            <label htmlFor="username" style={{ textAlign: isArabic ? 'right' : 'left' }}>
              {t('USERNAME')}
            </label>
            <input
              id="username"
              {...register('userName')}
              placeholder={t('ENTER_USERNAME')}
              style={{ textAlign: isArabic ? 'right' : 'left' }}
              className={errors.userName ? 'form-error-input' : ''}
            />
            {errors.userName && (
              <span
                style={{ textAlign: isArabic ? 'right' : 'left', marginTop: 5 }}
                className="error-message"
              >
                {t(errors.userName.message!)}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ textAlign: isArabic ? 'right' : 'left' }}>
              {t('PASSWORD')}
            </label>

            <div className="password-input-container">
              <input
                id="password"
                type={!isPasswordHidden ? 'text' : 'password'}
                {...register('password')}
                placeholder={t('ENTER_PASSWORD')}
                style={{ textAlign: isArabic ? 'right' : 'left' }}
                className={errors.userName ? 'form-error-input' : ''}
              />

              <button
                type="button"
                className="password-toggle"
                style={{
                  left: isArabic ? '12px' : 'auto',
                  right: isArabic ? 'auto' : '12px',
                }}
                onClick={() => setIsPasswordHidden(!isPasswordHidden)}
              >
                {isPasswordHidden ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span
                style={{ textAlign: isArabic ? 'right' : 'left', marginTop: 5 }}
                className="error-message"
              >
                {t(errors.password.message!)}
              </span>
            )}
          </div>

          {/* <div
            className={`remember-container ${isArabic ? "rtl-header" : "ltr-header"}`}
          >
            <label className="remember-label">
              <input type="checkbox" />
              <p>{t("REMEMBER")}</p>
            </label>
          </div> */}

          <button type="submit" className="login-button" disabled={isLoading}>
            {t('LOGIN')}
          </button>
        </form>
      </div>
      <div className="first-half-container">
        <h1 className="website-name">
          {/* ERP System for B-Connect */} {t('WEBSITE_NAME')}
        </h1>
        <h2 style={{ color: 'white', fontSize: 18 }}>
          {/* A Centralized Platform used for automating corporate processes*/}
          {t('WEBSITE_DESCRIPTION')}
        </h2>
        <ul>
          <li style={{ color: 'white' }}>{t('WEBSITE_FEATURE_ONE')}</li>
          <li style={{ color: 'white' }}>{t('WEBSITE_FEATURE_TWO')}</li>
          <li style={{ color: 'white' }}>{t('WEBSITE_FEATURE_THREE')}</li>
        </ul>
      </div>
    </div>
  );
}

export default LoginPage;
