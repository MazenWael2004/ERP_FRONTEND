import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth.tsx';
import { useEffect } from 'react';
import { useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createZoneSchema } from '../validation.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createZone,fetchZones } from '../api/zoneService.ts';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';

function NewZone() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setPasswordFields] = useState(true);
  const [roles, setRoles] = useState([]);

  // console.log(user);

  const handleSave = async (data: any) => {
    setIsLoading(true);

    try {
      const result = await createZone(data);

      console.log(result);

      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('ZONE_CREATED_SUCCESSFULLY'),
        confirmButtonText: t('OK'),
      });

      nav('/zones');
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
} finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createZoneSchema),
  });

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetchZones();
        setRoles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadZones();
  }, []);

  return (
    <form
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(handleSave)}
    >
      <div>
        <Label htmlFor="zoneNameEn">{t('ZONE_NAME_EN')}</Label>
        <Input id="zoneNameEn" className="mt-2 w-full" {...register('zoneNameEn')} />
        {errors.zoneNameEn && <span className="error-message">{t(errors.zoneNameEn.message!)}</span>}
      </div>

  

      <div>
        <Label htmlFor="zoneNameAr">{t('ZONE_NAME_AR')}</Label>
        <Input id="zoneNameAr" className="mt-2 w-full" {...register('zoneNameAr')} />
        {errors.zoneNameAr && <span className="error-message">{t(errors.zoneNameAr.message!)}</span>}
      </div>

    
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default NewZone;
