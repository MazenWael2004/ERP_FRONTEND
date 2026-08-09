import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createJobSchema } from "../../features/jobs/validation";
import { checkJobExists } from "../../features/jobs/api/jobService";

export default function JobForm({ formId, defaultValues, onSubmit }) {
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
    resolver: zodResolver(createJobSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const jobCode = watch("jobCode");
  const jobTitleEn = watch("jobTitleEn");
  const jobTitleAr = watch("jobTitleAr");

  const validateUniqueField = (fieldName, apiField, value) => {
    if (!value?.trim()) {
      clearErrors(fieldName);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { exists } = await checkJobExists(apiField, value);

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
    return validateUniqueField("jobCode", "code", jobCode);
  }, [jobCode]);

  useEffect(() => {
    return validateUniqueField("jobTitleEn", "title_en", jobTitleEn);
  }, [jobTitleEn]);

  useEffect(() => {
    return validateUniqueField("jobTitleAr", "title_ar", jobTitleAr);
  }, [jobTitleAr]);

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
            htmlFor="jobCode"
            style={{ textAlign: isArabic ? "right" : "left" }}
          >
            {t("JOB_CODE")}
            <span className="required">*</span>
          </label>

          <input
            id="jobCode"
            {...register("jobCode")}
            placeholder={t("ENTER_JOB_CODE")}
            style={{ textAlign: isArabic ? "right" : "left" }}
          />

          {errors.jobCode && (
            <span className="error-message">{t(errors.jobCode.message)}</span>
          )}
        </div>

        <label
          htmlFor="jobTitleEn"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("JOB_TITLE_EN")}
          <span className="required">*</span>
        </label>

        <input
          id="jobTitleEn"
          {...register("jobTitleEn")}
          placeholder={t("ENTER_JOB_TITLE_EN")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.jobTitleEn && (
          <span className="error-message">{t(errors.jobTitleEn.message)}</span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="jobTitleAr"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("JOB_TITLE_AR")}
          <span className="required">*</span>
        </label>

        <input
          id="jobTitleAr"
          {...register("jobTitleAr")}
          placeholder={t("ENTER_JOB_TITLE_AR")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.jobTitleAr && (
          <span className="error-message">{t(errors.jobTitleAr.message)}</span>
        )}
      </div>
      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" {...register("isZoneMandatory")} />
          <span>{t("IS_ZONE_MANDATORY")}</span>
        </label>
      </div>
    </form>
  );
}
