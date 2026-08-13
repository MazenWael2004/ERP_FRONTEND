import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { getZoneById, updateZone } from "../api/zoneService";
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from "sweetalert2";
import { Autocomplete, TextField } from "@mui/material";
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createZoneSchema  } from "../validation";

function EditUser() {
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
  resolver: zodResolver(createZoneSchema),
});



  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const response = await getZoneById(Number(id));

        reset({
          zoneNameEn: response.data.name_en,
          zoneNameAr:response.data.name_ar
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate("/404", { replace: true });
          return;
        }
        console.error(error);
      }
    };

    fetchUser();
  }, [id,reset]);

  const handleSave = async (data:any) => {
    if (!id) return;
    console.log(data);
    try {
      await updateZone(Number(id),data);

      toast.success(t("ZONE_UPDATED_SUCCESSFULLY"));
      navigate("/zones");
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
        <Label htmlFor="zoneNameEn">{t("ZONE_NAME_EN")}</Label>
        <Input id="zoneNameEn" className="mt-2 w-full" {...register('zoneNameEn')} />
        {errors.zoneNameEn && (
          <span className="error-message">{t(errors.zoneNameEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="zoneNameAr">{t("ZONE_NAME_AR")}</Label>
        <Input id="zoneNameAr" className="mt-2 w-full" {...register('zoneNameAr')} />
        {errors.zoneNameAr && (
          <span className="error-message">{t(errors.zoneNameAr.message!)}</span>
        )}
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

export default EditUser;
