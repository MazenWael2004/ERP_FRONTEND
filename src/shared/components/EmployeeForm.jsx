import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployeeSchema } from "../../features/employees/validation";
import { fetchJobs } from "../../features/jobs/api/jobService";
import { fetchZones } from "../../features/zones/api/zoneService";
import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import { Button } from '../src/components/ui/button';
import { Calendar } from '../src/components/ui/calendar';
import { Checkbox } from '../src/components/ui/checkbox';
import { Input } from '../src/components/ui/input';
import { Label } from '../src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '../src/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';
import { Switch } from '../src/components/ui/switch';
import { Textarea } from '../src/components/ui/textarea';

function EmployeeForm({ formId, defaultValues, onSubmit }) {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const employeeNameEn = watch("employeeNameEn");
  const employeeNameAr = watch("employeeNameAr");
  const jobId = watch("jobId");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [zones, setZones] = useState([]);
  const [isZonesInputDisabled, setIsZonesInputDisabled] = useState(true);
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs();
        setJobs(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetchZones();
        setZones(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadZones();
  }, []);

  useEffect(() => {
  const job = jobs.find((job) => job.id === jobId);
  setIsZonesInputDisabled(!job?.is_zone_mandatory);
}, [jobId, jobs]);

  return (
    <form
      id={formId}
      className="login-form-container"
      style={{ maxWidth: "100%" }}
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
    >
      <div className={`form-group ${isArabic ? "rtl-header" : "ltr-header"}`}>
        <div className="form-group">
          <label
            htmlFor="employeeNameEn"
            style={{ textAlign: isArabic ? "right" : "left" }}
          >
            {t("EMPLOYEE_NAME_EN")}
            <span className="required">*</span>
          </label>

          <input
            id="employeeNameEn"
            {...register("employeeNameEn")}
            placeholder={t("ENTER_EMPLOYEE_NAME_EN")}
            style={{ textAlign: isArabic ? "right" : "left" }}
          />

          {errors.employeeNameEn && (
            <span className="error-message">
              {t(errors.employeeNameEn.message)}
            </span>
          )}
        </div>

        <label
          htmlFor="employeeNameAr"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("EMPLOYEE_NAME_AR")}
          <span className="required">*</span>
        </label>

        <input
          id="employeeNameAr"
          {...register("employeeNameAr")}
          placeholder={t("ENTER_EMPLOYEE_NAME_AR")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.employeeNameAr && (
          <span className="error-message">
            {t(errors.employeeNameAr.message)}
          </span>
        )}
      </div>
      <div className="form-group">
          <label
            htmlFor="email"
            style={{ textAlign: isArabic ? "right" : "left" }}
          >
            {t("EMAIL")}
            <span className="required">*</span>
          </label>

          <input
            id="email"
            type="text"
 n          autoComplete="new-password"
            {...register("email")}
            placeholder={t("ENTER_EMAIL")}
            style={{ textAlign: isArabic ? "right" : "left" }}
          />

          {errors.email && (
            <span className="error-message">
              {t(errors.email.message)}
            </span>
          )}
        </div>
      <div className="form-group">
        <label
          htmlFor="employeeNum"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("EMPLOYEE_NUM")}
          <span className="required">*</span>
        </label>

        <input
          id="employeeNum"
          {...register("employeeNum")}
          placeholder={t("ENTER_EMPLOYEE_NUM")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.employeeNum && (
          <span className="error-message">{t(errors.employeeNum.message)}</span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="street"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("STREET")}
          <span className="required">*</span>
        </label>

        <input
          id="street"
          {...register("street")}
          type="text"
 n        autoComplete="new-password"
          placeholder={t("ENTER_STREET")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.street && (
          <span className="error-message">{t(errors.street.message)}</span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="governorate"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("GOVERNORATE")}
          <span className="required">*</span>
        </label>

        <input
          id="governorate"
          {...register("governorate")}
          placeholder={t("ENTER_GOVERNORATE")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.governorate && (
          <span className="error-message">{t(errors.governorate.message)}</span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="city"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("CITY")}
          <span className="required">*</span>
        </label>

        <input
          id="city"
          {...register("city")}
          type="text"
 n        autoComplete="new-password"
          placeholder={t("ENTER_CITY")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.city && (
          <span className="error-message">{t(errors.city.message)}</span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="telephoneNum"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("TELEPHONE_NUMBER")}
          <span className="required">*</span>
        </label>

        <input
          id="telephoneNum"
          {...register("telephoneNum")}
          placeholder={t("ENTER_TELEPHONE_NUMBER")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.telephoneNum && (
          <span className="error-message">
            {t(errors.telephoneNum.message)}
          </span>
        )}
      </div>
      <div className="form-group">
        <label
          htmlFor="birthDate"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("BIRTH_DATE")}
          <span className="required">*</span>
        </label>

        <input
          id="birthDate"
          type="date"
          {...register("birthDate")}
          placeholder={t("ENTER_BIRTH_DATE")}
          style={{ textAlign: isArabic ? "right" : "left" }}
        />

        {errors.birthDate && (
          <span className="error-message">{t(errors.birthDate.message)}</span>
        )}
      </div>
      <div className="form-group">
        <label
          htmlFor="jobId"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("JOB")}
          <span className="required">*</span>
        </label>

        <select
          id="jobId"
          {...register("jobId", { valueAsNumber: true })}
          style={{ textAlign: isArabic ? "right" : "left" }}
          defaultValue=""
          className="form-select"
        >
          <option value="" disabled>
            {t("SELECT_JOB")}
          </option>

          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {isArabic ? job.title_ar : job.title_en}
            </option>
          ))}
        </select>

        {errors.jobId && (
          <span className="error-message">{t(errors.jobId.message)}</span>
        )}
      </div>
      {!isZonesInputDisabled && (
        <div className="form-group">
          <Controller
            name="zones"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={zones}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  isArabic ? option.name_ar : option.name_en
                }
                value={zones.filter((z) => (field.value ?? []).includes(z.id))}
                onChange={(_, selectedZones) => {
                  const ids = selectedZones.map((z) => z.id);
                  field.onChange(ids);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("ZONE")}
                    error={!!errors.zones}
                    helperText={errors.zones ? t(errors.zones.message) : ""}
                  />
                )}
              />
            )}
          />
        </div>
      )}
    </form>
  );
}

export default EmployeeForm;
