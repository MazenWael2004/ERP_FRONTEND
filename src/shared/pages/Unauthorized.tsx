import { useTranslation } from 'react-i18next';
import React from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import ForbiddenLogo from '../../assets/images/logos/403-error-forbidden.png';

function Unauthorized() {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-lg sm:p-10">

        {/* 403 Image */}
        <div className="mb-6 flex items-center justify-center">
          <img
            src={ForbiddenLogo}
            alt="403 Forbidden"
            className="h-auto w-64 object-contain sm:w-72"
          />
        </div>

        {/* Error Code */}
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Error 403
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          {t("ACCESS_DENIED")}
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {t("ACCESS_DENIED_MESSAGE")}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">

         
          <button
            type="button"
            onClick={() => navigate('/')}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-primary
              px-5
              py-2.5
              text-sm
              font-medium
              text-primary-foreground
              transition-opacity
              hover:opacity-90
            "
          >
            <Icon
              icon="mdi:home-outline"
              width={18}
              height={18}
            />

            Go Home
          </button>

        </div>
      </div>
    </div>
  );
}

export default Unauthorized;

