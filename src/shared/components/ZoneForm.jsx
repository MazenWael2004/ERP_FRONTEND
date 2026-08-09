import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createZoneSchema } from "../../features/zones/validation";
import { checkZoneExists } from "../../features/zones/api/zoneService";


export default function ZoneForm({
  formId,
  defaultValues,
  onSubmit,
}) {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createZoneSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const zoneNameEn = watch("zoneNameEn");
  const zoneNameAr = watch("zoneNameAr");

  const validateUniqueField = (
    fieldName,
    apiField,
    value
  ) => {
    if (!value?.trim()) {
      clearErrors(fieldName);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { exists } = await checkZoneExists(apiField, value);

        if (exists) {
          setError(fieldName, {
            type: "manual",
            message: t("VALUE_ALREADY_EXISTS"),
          });
        } else {
          clearErrors(fieldName);
        }
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    return validateUniqueField(
      "zoneNameEn",
      "name_en",
      zoneNameEn
    );
  }, [zoneNameEn]);

  useEffect(() => {
    return validateUniqueField(
      "zoneNameAr",
      "name_ar",
      zoneNameAr
    );
  }, [zoneNameAr]);



  return (
    <form
      id={formId}
      className="login-form-container"
      style={{ maxWidth: "100%" }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className={`form-group ${isArabic ? "rtl-header" : "ltr-header"}`}>
        <div className="form-group">
          <label
            htmlFor="zoneNameEn"
            style={{ textAlign: isArabic ? "right" : "left" }}
          >
            {t("ZONE_NAME_EN")}
            <span className="required">*</span>
          </label>

          <input
            id="zoneNameEn"
            {...register("zoneNameEn")}
            placeholder={t("ENTER_ZONE_NAME_EN")}
            style={{ textAlign: isArabic ? "right" : "left" }}
          />

          {errors.zoneNameEn && (
            <span className="error-message">
              {t(errors.zoneNameEn.message)}
            </span>
          )}
        </div>

        <label
          htmlFor="zoneNameAr"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("ZONE_NAME_AR")}
          <span className="required">*</span>
        </label>

        <input
          id="zoneNameAr"
          {...register("zoneNameAr")}
          placeholder={t("ENTER_ZONE_NAME_AR")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.zoneNameAr && (
          <span className="error-message">
            {t(errors.zoneNameAr.message)}
          </span>
        )}
      </div>
    </form>
  );
}
