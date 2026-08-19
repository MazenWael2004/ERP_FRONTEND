import { use, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { editRole, getRoleById,fetchPages,checkRoleExists } from '../api/roleService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createRoleSchema } from '../validation';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { useLocation } from 'react-router-dom';

const availablePages = [
  {
    id: 4,
    title_en: 'Users',
    title_ar: 'المستخدمون',
    route: '/users',
  },

  {
    id: 5,
    title_en: 'Roles',
    title_ar: 'الأدوار',
    route: '/roles',
  },
];

const availableActions = [
  {
    id: 1,
    code: 'READ',
    name_en: 'Read',
    name_ar: 'قراءة',
  },
  {
    id: 2,
    code: 'WRITE',
    name_en: 'Write',
    name_ar: 'تعديل',
  },
  {
    id: 3,
    code: 'CREATE',
    name_en: 'Create',
    name_ar: 'إنشاء',
  },
  {
    id: 4,
    code: 'DELETE',
    name_en: 'Delete',
    name_ar: 'حذف',
  },
];

function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [selectedPage, setSelectedPage] = useState('');
  const [pages,setPages] = useState([]);
  const {user,refreshPermissions} = useAuth();
  const currentRole = location.state?.role;

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRoleSchema),

    defaultValues: {
      roleNameEn: '',
      roleNameAr: '',
      permissions: [],
    },
  });

  const permissions = watch('permissions') || [];

  // ==========================================
  // GET ROLE
  // ==========================================

  useEffect(() => {
    if (!currentRole) return;

    const fetchRole = async () => {
      try {
        const response = await getRoleById(Number(currentRole.id));

        const role = response.data;

        /*
          API:

          permissions: [
            {
              page: {
                id: 4
              },
              action: {
                id: 1
              }
            }
          ]

          Convert to:

          permissions: [
            {
              page_id: 4,
              action_id: 1
            }
          ]
        */

        const rolePermissions =
          role.permissions?.map((permission) => ({
            page_id: permission.page.id,
            action_id: permission.action.id,
          })) || [];

        reset({
          roleNameEn: role.name_en,
          roleNameAr: role.name_ar,
          permissions: rolePermissions,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate('/404', {
            replace: true,
          });

          return;
        }

        console.error(error);
      }
    };

    fetchRole();
  }, [id, reset, navigate]);

  const loadPages = async () => {
        try {
          setIsLoading(true);
          const response = await fetchPages();
          setPages(response.data);
        } catch (error) {
          console.error('Failed to fetch pages:', error);
        } finally {
          setIsLoading(false);
        }
      };
    
      useEffect(() => {
        loadPages();
      }, []);

      const name_en = watch('roleNameEn');
        const name_ar = watch('roleNameAr');
      
        const checkFieldExists = async (
          field: 'name_en' | 'name_ar',
          value: string,
          formField: 'roleNameEn' | 'roleNameAr',
          errorMessage: string,
        ) => {
          try {
            const response = await checkRoleExists(field, value,currentRole.id);
      
            console.log(`${field} response:`, response);
      
            if (response.exists) {
              setError(formField, {
                type: 'manual',
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
          if (!name_en || name_en.trim() === '') {
            clearErrors('roleNameEn');
            return;
          }
      
          const timer = setTimeout(() => {
            checkFieldExists('name_en', name_en, 'roleNameEn', 'ROLE_NAME_EN_EXISTS');
          }, 500);
      
          return () => clearTimeout(timer);
        }, [name_en]);
      
        useEffect(() => {
          if (!name_ar || name_ar.trim() === '') {
            clearErrors('roleNameAr');
            return;
          }
      
          const timer = setTimeout(() => {
            checkFieldExists('name_ar', name_ar, 'roleNameAr', 'ROLE_NAME_AR_EXISTS');
          }, 500);
      
          return () => clearTimeout(timer);
        }, [name_ar]);

  // ==========================================
  // CHECK PERMISSION
  // ==========================================

  const hasPermission = (pageId, actionId) => {
    return permissions.some(
      (permission) => permission.page_id === pageId && permission.action_id === actionId,
    );
  };

  // ==========================================
  // CHANGE PERMISSION
  // ==========================================

  const handlePermissionChange = (
  pageId: number,
  actionId: number,
  checked: boolean
) => {
  const currentPermissions = [...permissions];

  const action = availableActions.find(
    (action) => action.id === actionId
  );

  const isRead = action?.name_en.toLowerCase() === 'read';

  // --------------------------------------------------
  // UNCHECK READ → remove ALL permissions for this page
  // --------------------------------------------------
  if (isRead && !checked) {
    const filteredPermissions = currentPermissions.filter(
      (permission) => permission.page_id !== pageId
    );

    setValue('permissions', filteredPermissions, {
      shouldDirty: true,
      shouldValidate: true,
    });

    return;
  }

  // --------------------------------------------------
  // CHECK another action → only allow if READ is enabled
  // --------------------------------------------------
  if (!isRead && checked) {
    const readAction = availableActions.find(
      (action) => action.name_en.toLowerCase() === 'read'
    );

    const hasRead = readAction
      ? currentPermissions.some(
          (permission) =>
            permission.page_id === pageId &&
            permission.action_id === readAction.id
        )
      : false;

    if (!hasRead) {
      return;
    }
  }

  // --------------------------------------------------
  // Normal CHECK / UNCHECK
  // --------------------------------------------------

  const existingIndex = currentPermissions.findIndex(
    (permission) =>
      permission.page_id === pageId &&
      permission.action_id === actionId
  );

  // CHECK
  if (checked) {
    if (existingIndex === -1) {
      currentPermissions.push({
        page_id: pageId,
        action_id: actionId,
      });
    }
  }

  // UNCHECK
  else {
    if (existingIndex !== -1) {
      currentPermissions.splice(existingIndex, 1);
    }
  }

  setValue('permissions', currentPermissions, {
    shouldDirty: true,
    shouldValidate: true,
  });
};

  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = async (data) => {
    if (!currentRole) return;

    console.log("Submitting:", data);

    try {
        setIsLoading(true);

        // 1. Update role + permissions in DB
        await editRole(Number(currentRole.id), data);

      
        
            await refreshPermissions();
        

        toast.success(t("ROLE_UPDATED_SUCCESSFULLY"));

        navigate("/roles");
    } catch (error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log("Backend message:", message);

        if (t(message) === "Role name En already exists") {
            setError("roleNameEn", {
                type: "server",
                message: "ROLE_NAME_EN_EXISTS",
            });
            return;
        }

        if (t(message) === "Role name Ar already exists") {
            setError("roleNameAr", {
                type: "server",
                message: "ROLE_NAME_AR_EXISTS",
            });
            return;
        }
    }

    console.error("Unexpected error:", error);
} finally {
        setIsLoading(false);
    }
};
  return (
    <form onSubmit={handleSubmit(handleSave)} className="grid gap-6">
      {/* =========================
          ROLE NAME EN
      ========================= */}

      <div>
        <Label htmlFor="roleNameEn">{t('ROLE_NAME_EN')}</Label>

        <Input id="roleNameEn" className="mt-2 w-full" {...register('roleNameEn')} />

        {errors.roleNameEn && <span className="error-message">{t(errors.roleNameEn.message!)}</span>}
      </div>

      {/* =========================
          ROLE NAME AR
      ========================= */}

      <div>
        <Label htmlFor="roleNameAr">{t('ROLE_NAME_AR')}</Label>

        <Input id="roleNameAr" className="mt-2 w-full" {...register('roleNameAr')} />

        {errors.roleNameAr && <span className="error-message">{t(errors.roleNameAr.message!)}</span>}
      </div>

      
     {/* =====================================================
         PERMISSIONS
     ===================================================== */}
     
     <div className="mt-4">
     
         <Label className="text-base font-semibold">
             Permissions
         </Label>
     
         <p className="mt-1 text-xs text-gray-500">
             Select the actions this role can perform for each page.
         </p>
     
         {/* TWO COLUMN LAYOUT */}
     
         <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
     
             {pages.map((page) => (
     
                 <div
                     key={page.id}
                     className="overflow-hidden rounded-md border"
                 >
     
                     {/* PAGE HEADER */}
     
                     <div
                         className="
                             border-b
                             bg-gray-50
                             px-3
                             py-2
                             text-sm
                             font-semibold
                             dark:bg-gray-800
                         "
                     >
                         {page.title_en}
                     </div>
     
     
                     {/* ACTIONS */}
     
                     <div
                         className="
                             grid
                             grid-cols-2
                             gap-x-3
                             gap-y-2
                             p-3
                         "
                     >
     
                         {availableActions.map((action) => (
     
                             <label
                                 key={action.id}
                                 className="
                                     flex
                                     cursor-pointer
                                     items-center
                                     gap-2
                                     text-xs
                                 "
                             >
     
                                 <input
                                     type="checkbox"
                                     checked={hasPermission(
                                         page.id,
                                         action.id,
                                     )}
                                     onChange={(e) =>
                                         handlePermissionChange(
                                             page.id,
                                             action.id,
                                             e.target.checked,
                                         )
                                     }
                                     className="
                                         h-3.5
                                         w-3.5
                                         cursor-pointer
                                     "
                                 />
     
                                 <span>
                                     {action.name_en}
                                 </span>
     
                             </label>
     
                         ))}
     
                     </div>
     
                 </div>
     
             ))}
     
         </div>
     
     </div>
     

      {/* =========================
          SAVE
      ========================= */}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default EditRole;
