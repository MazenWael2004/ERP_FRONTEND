import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { getZoneById, updateZone,checkZoneExists } from "../api/zoneService";
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from "sweetalert2";
import { Autocomplete, TextField } from "@mui/material";
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createZoneSchema  } from "../validation";
import { useLocation } from "react-router-dom";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const currentZone = location.state?.zone;



  const {
  register,
  control,
  watch,
  setError,
  clearErrors,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  resolver: zodResolver(createZoneSchema),
});



  useEffect(() => {
    if (!currentZone) return;

    const fetchZone = async () => {
      try {
        const response = await getZoneById(currentZone.id);

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

    fetchZone();
  }, [id,reset]);

  const nameEn = watch("zoneNameEn");
    const nameAr = watch("zoneNameAr");
  
    const checkFieldExists = async (
    field: "name_en" | "name_ar",
    value: string,
    formField: "zoneNameEn" | "zoneNameAr",
    errorMessage: string
  ) => {
    try {
      const response = await checkZoneExists(field, value,currentZone.id);
  
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
    if (!nameEn || nameEn.trim() === "") {
      clearErrors("zoneNameEn");
      return;
    }
  
    const timer = setTimeout(() => {
      checkFieldExists(
        "name_en",
        nameEn,
        "zoneNameEn",
        "ZONE_EN_ALREADY_EXISTS"
      );
    }, 500);
  
    return () => clearTimeout(timer);
  }, [nameEn]);
  
  
  useEffect(() => {
    if (!nameAr || nameAr.trim() === "") {
      clearErrors("zoneNameAr");
      return;
    }
  
    const timer = setTimeout(() => {
      checkFieldExists(
        "name_ar",
        nameAr,
        "zoneNameAr",
        "ZONE_AR_ALREADY_EXISTS"
      );
    }, 500);
  
    return () => clearTimeout(timer);
  }, [nameAr]);
  

  const handleSave = async (data:any) => {
    if (!currentZone) return;
    console.log(data);
    try {
      await updateZone(currentZone.id,data);

      toast.success(t("ZONE_UPDATED_SUCCESSFULLY"));
      navigate("/zones");
    } catch (error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log("Backend message:", message);

        if (t(message) === t("ZONE_EN_ALREADY_EXISTS")) {
            setError("zoneNameEn", {
                type: "server",
                message: "ZONE_EN_ALREADY_EXISTS",
            });
            return;
        }

        if (t(message) === t("ZONE_AR_ALREADY_EXISTS")) {
            setError("zoneNameAr", {
                type: "server",
                message: "ZONE_AR_ALREADY_EXISTS",
            });
            return;
        }
    }

    console.error("Unexpected error:", error);
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
