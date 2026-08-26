import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
// fix later.... checkProgramExists
import { getProgramById, updateProgram} from "../api/programService";
import { useAuth } from '../../auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from "sweetalert2";
import { Autocomplete, TextField } from "@mui/material";
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createProgramSchema  } from "../validation";
import { useLocation } from "react-router-dom";

function EditProgram() {
 
    const {id} = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const currentProgram = location.state?.program;



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
  resolver: zodResolver(createProgramSchema),
});



 useEffect(() => {
  if (!currentProgram) {
    navigate("/programs", { replace: true });
    return;
  }

  const fetchProgram = async () => {
    try {
      const response = await getProgramById(currentProgram.id);

      reset({
        nameEn: response.data.name_en,
        nameAr: response.data.name_ar,
        code: response.data.code,
      });
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        navigate("/404", { replace: true });
        return;
      }

      console.error(error);
    }
  };

  fetchProgram();
}, [currentProgram, navigate, reset]);

//   const nameEn = watch("nameEn");
//     const nameAr = watch("nameAr");
  
//     const checkFieldExists = async (
//     field: "name_en" | "name_ar",
//     value: string,
//     formField: "zoneNameEn" | "zoneNameAr",
//     errorMessage: string
//   ) => {
//     try {
//       const response = await checkZoneExists(field, value,currentZone.id);
  
//       console.log(`${field} response:`, response);
  
//       if (response.exists) {
//         setError(formField, {
//           type: "manual",
//           message: errorMessage,
//         });
//       } else {
//         clearErrors(formField);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };
  
//   useEffect(() => {
//     if (!nameEn || nameEn.trim() === "") {
//       clearErrors("zoneNameEn");
//       return;
//     }
  
//     const timer = setTimeout(() => {
//       checkFieldExists(
//         "name_en",
//         nameEn,
//         "zoneNameEn",
//         "ZONE_EN_ALREADY_EXISTS"
//       );
//     }, 500);
  
//     return () => clearTimeout(timer);
//   }, [nameEn]);
  
  
//   useEffect(() => {
//     if (!nameAr || nameAr.trim() === "") {
//       clearErrors("zoneNameAr");
//       return;
//     }
  
//     const timer = setTimeout(() => {
//       checkFieldExists(
//         "name_ar",
//         nameAr,
//         "zoneNameAr",
//         "ZONE_AR_ALREADY_EXISTS"
//       );
//     }, 500);
  
//     return () => clearTimeout(timer);
//   }, [nameAr]);
  

  const handleSave = async (data:any) => {
    if (!currentProgram) return;
    console.log(data);
    try {
      await updateProgram(currentProgram.id,data);

      toast.success(t("PROGRAM_UPDATED_SUCCESSFULLY"));
      navigate("/programs");
    } catch (error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log("Backend message:", message);

        if (t(message) === t("PROGRAM_NAME_EN_EXISTS")) {
            setError("nameEn", {
                type: "server",
                message: "PROGRAM_NAME_EN_EXISTS",
            });
            return;
        }

        if (t(message) === t("PROGRAM_NAME_AR_EXISTS")) {
            setError("nameAr", {
                type: "server",
                message: "PROGRAM_NAME_AR_EXISTS",
            });
            return;
        }
        if (t(message) === t("PROGRAM_CODE_EXISTS")) {
            setError("code", {
                type: "server",
                message: "PROGRAM_CODE_EXISTS",
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
        <Label htmlFor="nameEn">{t("PROGRAM_NAME_EN")}</Label>
        <Input id="nameEn" className="mt-2 w-full" {...register('nameEn')} />
        {errors.nameEn && (
          <span className="error-message">{t(errors.nameEn.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="programNameAr">{t("PROGRAM_NAME_AR")}</Label>
        <Input id="programNameAr" className="mt-2 w-full" {...register('nameAr')} />
        {errors.nameAr && (
          <span className="error-message">{t(errors.nameAr.message!)}</span>
        )}
      </div>

      <div>
        <Label htmlFor="programCode">{t("PROGRAM_CODE")}</Label>
        <Input id="programCode" className="mt-2 w-full" {...register('code')} />
        {errors.code && (
          <span className="error-message">{t(errors.code.message!)}</span>
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
          {t("SAVE")}
        </Button>
      </div>
    </form>
  );
}

export default EditProgram;
