import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { updateJob,getJobById,checkJobExists } from "../api/jobService";
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from "sweetalert2";
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createJobSchema  } from "../validation";
import Spinner from "src/shared/components/Spinner";
import { useLocation } from "react-router-dom";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const currentJob = location.state?.job;


  const {
  register,
  control,
  watch,
  handleSubmit,
  setError,
  clearErrors,
  reset,
  formState: { errors },
} = useForm({
  resolver: zodResolver(createJobSchema),
});



  useEffect(() => {
    if (!currentJob) navigate("/jobs");

    const fetchJob = async () => {
      try {
        const response = await getJobById(Number(currentJob.id));

        reset({
          jobCode: response.data.code,
          jobTitleEn:response.data.title_en,
          jobTitleAr:response.data.title_ar,
          isZoneMandatory:response.data.is_zone_mandatory,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate("/404", { replace: true });
          return;
        }
        console.error(error);
      }
    };

    fetchJob();
  }, [id,reset]);

  const code = watch("jobCode");
    const title_en = watch("jobTitleEn");
    const title_ar = watch("jobTitleAr");
  
     const checkFieldExists = async (
      field: "code" | "title_en" | "title_ar",
      value: string,
      formField: "jobCode" | "jobTitleEn" | "jobTitleAr",
      errorMessage: string
    ) => {
      try {
        const response = await checkJobExists(field, value,currentJob.id);
    
        console.log(`${field} response:`, response);
    
        if (response.exists) {
          setError(formField, {
            type: "manual",
            message: errorMessage,
          });
        } else {
          clearErrors(formField);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    useEffect(() => {
      if (!code || code.trim() === "") {
        clearErrors("jobCode");
        return;
      }
    
      const timer = setTimeout(() => {
        checkFieldExists(
          "code",
          code,
          "jobCode",
          "JOB_CODE_ALREADY_EXISTS"
        );
      }, 500);
    
      return () => clearTimeout(timer);
    }, [code]);
  
  
    useEffect(() => {
      if (!title_en || title_en.trim() === "") {
        clearErrors("jobTitleEn");
        return;
      }
    
      const timer = setTimeout(() => {
        checkFieldExists(
          "title_en",
          title_en,
          "jobTitleEn",
          "JOB_TITLE_EN_ALREADY_EXISTS"
        );
      }, 500);
    
      return () => clearTimeout(timer);
    }, [title_en]);
    
  
    useEffect(() => {
      if (!title_ar || title_ar.trim() === "") {
        clearErrors("jobTitleAr");
        return;
      }
    
      const timer = setTimeout(() => {
        checkFieldExists(
          "title_ar",
          title_ar,
          "jobTitleAr",
          "JOB_TITLE_AR_ALREADY_EXISTS"
        );
      }, 500);
    
      return () => clearTimeout(timer);
    }, [title_ar]);
    

  const handleSave = async (data:any) => {
    if (!currentJob) return;
    console.log(data);
    try {
      setIsLoading(true);
      await updateJob(Number(currentJob.id),data);

      toast.success(t("JOB_UPDATED_SUCCESSFULLY"));
      navigate("/jobs");
    } catch (error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log("Backend message:", message);

        if (t(message) === t("JOB_CODE_ALREADY_EXISTS")) {
            setError("jobCode", {
                type: "server",
                message: "JOB_CODE_ALREADY_EXISTS",
            });
            return;
        }

        if (t(message) === t("JOB_TITLE_EN_ALREADY_EXISTS")) {
            setError("jobTitleEn", {
                type: "server",
                message: "JOB_TITLE_EN_ALREADY_EXISTS",
            });
            return;
        }

        if (t(message) === t("JOB_TITLE_AR_ALREADY_EXISTS")) {
            setError("jobTitleAr", {
                type: "server",
                message: "JOB_TITLE_AR_ALREADY_EXISTS",
            });
            return;
        }
    }

    console.error("Unexpected error:", error);
} finally{
      setIsLoading(false);
    }
  };

 



   return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >

   
      <div>
        <Label htmlFor="jobCode">{t('JOB_CODE')}</Label>
        <Input id="jobCode" className="mt-2 w-full" {...register('jobCode')} />
        {errors.jobCode && <span className="error-message">{t(errors.jobCode.message!)}</span>}
      </div>

  

      <div>
        <Label htmlFor="jobTitleEn">{t('JOB_TITLE_EN')}</Label>
        <Input id="jobTitleEn" className="mt-2 w-full" {...register('jobTitleEn')} />
        {errors.jobTitleEn && <span className="error-message">{t(errors.jobTitleEn.message!)}</span>}
      </div>

      <div>
        <Label htmlFor="jobTitleAr">{t('JOB_TITLE_AR')}</Label>
        <Input id="jobTitleAr" className="mt-2 w-full" {...register('jobTitleAr')} />
        {errors.jobTitleAr && (
          <span className="error-message">{t(errors.jobTitleAr.message!)}</span>
        )}
      </div>

      <div className="flex items-center space-x-2">
  <Input
    id="isZoneMandatory"
    type="checkbox"
    className="h-4 w-4"
    {...register("isZoneMandatory")}
  />

  <Label htmlFor="isZoneMandatory">
    {t("IS_ZONE_MANDATORY")}
  </Label>
</div>


     

      


      {/* <div>
        <Label htmlFor="countries">Select Input</Label>
        <Select>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>...</SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" className="mt-2 w-full" />
      </div> */}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {t("SAVE")}
        </Button>
      </div>
    </form>
  );
}

export default EditJob;
