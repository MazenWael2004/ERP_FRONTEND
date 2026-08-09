import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { updateJob,getJobById } from "../api/jobService";
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from "sweetalert2";
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createJobSchema  } from "../validation";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);


  const {
  register,
  control,
  watch,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  resolver: zodResolver(createJobSchema),
});



  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await getJobById(Number(id));

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

  const handleSave = async (data:any) => {
    if (!id) return;
    console.log(data);
    try {
      await updateJob(Number(id),data);

      toast.success(t("JOB_UPDATED_SUCCESSFULLY"));
      navigate("/jobs");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: t(error.response?.data.error.message),
            confirmButtonText: t('OK'),
          });
          console.log(error.response?.data);
        } else if(error.response?.status === 404) {
          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: t(error.response?.data.error.message),
            confirmButtonText: t('OK'),
          });
          console.log(error.response?.data);
        }
      } else {
        console.log('Unexpected error');
      }
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
          Save
        </Button>
      </div>
    </form>
  );
}

export default EditJob;
