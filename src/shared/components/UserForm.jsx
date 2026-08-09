import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect,useState } from "react";
import { createUserSchema,editUserSchema} from "../../features/users/validation";
import { fetchRoles } from "../../features/roles/api/roleService";
import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
// import { checkJobExists } from "../../features/jobs/api/jobService";

export default function UserForm({
  formId,
  defaultValues,
  onSubmit,
  showPasswordFields = true,
}) {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [roles, setRoles] = useState([]);
  const schema = showPasswordFields
  ? createUserSchema
  : editUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
      const loadRoles = async () => {
        try {
          const response = await fetchRoles();
          setRoles(response.data);
        } catch (err) {
          console.error(err);
        }
      };
  
      loadRoles();
    }, []);

//   const jobCode = watch("jobCode");
//   const jobTitleEn = watch("jobTitleEn");
//   const jobTitleAr = watch("jobTitleAr");

//   const validateUniqueField = (
//     fieldName,
//     apiField,
//     value
//   ) => {
//     if (!value?.trim()) {
//       clearErrors(fieldName);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       try {
//         const { exists } = await checkJobExists(apiField, value);

//         if (exists) {
//           setError(fieldName, {
//             type: "manual",
//             message: t("VALUE_ALREADY_EXISTS"),
//           });
//         } else {
//           clearErrors(fieldName);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   };

//   useEffect(() => {
//     return validateUniqueField(
//       "jobCode",
//       "code",
//       jobCode
//     );
//   }, [jobCode]);

//   useEffect(() => {
//     return validateUniqueField(
//       "jobTitleEn",
//       "title_en",
//       jobTitleEn
//     );
//   }, [jobTitleEn]);

//   useEffect(() => {
//     return validateUniqueField(
//       "jobTitleAr",
//       "title_ar",
//       jobTitleAr
//     );
//   }, [jobTitleAr]);

  return (
    <form
  id={formId}
  className="login-form-container"
  style={{ maxWidth: "100%" }}
  onSubmit={handleSubmit(onSubmit)}
>
  {/* Username */}
  <div className="form-group">
    <label
      htmlFor="userName"
      style={{ textAlign: isArabic ? "right" : "left" }}
    >
      {t("USERNAME")}
      <span className="required">*</span>
    </label>

    <input
      id="userName"
      {...register("userName")}
      placeholder={t("ENTER_USERNAME")}
      style={{ textAlign: isArabic ? "right" : "left" }}
      className={errors.userName ? "form-error-input" : ""}
    />

    {errors.userName && (
      <span className="error-message">
        {t(errors.userName.message)}
      </span>
    )}
  </div>

  {/* Passwords */}
  {showPasswordFields && (
    <>
      <div className="form-group">
        <label
          htmlFor="password"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("PASSWORD")}
          <span className="required">*</span>
        </label>

        <input
          id="password"
          type="password"
          {...register("password")}
          placeholder={t("ENTER_PASSWORD")}
          style={{ textAlign: isArabic ? "right" : "left" }}
          className={errors.password ? "form-error-input" : ""}
        />

        {errors.password && (
          <span className="error-message">
            {t(errors.password.message)}
          </span>
        )}
      </div>

      <div className="form-group">
        <label
          htmlFor="confirmPassword"
          style={{ textAlign: isArabic ? "right" : "left" }}
        >
          {t("CONFIRM_PASSWORD")}
          <span className="required">*</span>
        </label>

        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          placeholder={t("ENTER_CONFIRM_PASSWORD")}
          style={{ textAlign: isArabic ? "right" : "left" }}
          className={errors.confirmPassword ? "form-error-input" : ""}
        />

        {errors.confirmPassword && (
          <span className="error-message">
            {t(errors.confirmPassword.message)}
          </span>
        )}
      </div>
    </>
  )}

  {/* Employee ID */}
  <div className="form-group">
    <label
      htmlFor="employeeId"
      style={{ textAlign: isArabic ? "right" : "left" }}
    >
      {t("EMPLOYEE_ID")}
      <span className="required">*</span>
    </label>

    <input
      id="employeeId"
      type="number"
      {...register("employeeId", { valueAsNumber: true })}
      placeholder={t("ENTER_EMPLOYEE_ID")}
      style={{ textAlign: isArabic ? "right" : "left" }}
      className={errors.employeeId ? "form-error-input" : ""}
    />

    {errors.employeeId && (
      <span className="error-message">
        {t(errors.employeeId.message)}
      </span>
    )}
  </div>

  {/* Roles */}
  <div className="form-group">
    <label style={{ textAlign: isArabic ? "right" : "left" }}>
      {t("ROLE")}
      <span className="required">*</span>
    </label>

    <Controller
      name="roles"
      control={control}
      defaultValue={[]}
      render={({ field }) => (
        <Autocomplete
          multiple
          options={roles}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) =>
            isArabic ? option.name_ar : option.name_en
          }
          value={roles.filter((r) =>
            (field.value ?? []).includes(r.id)
          )}
          onChange={(_, selectedRoles) =>
            field.onChange(selectedRoles.map((r) => r.id))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              error={!!errors.roles}
              helperText={
                errors.roles ? t(errors.roles.message) : ""
              }
            />
          )}
        />
      )}
    />
  </div>
</form>
  );
}