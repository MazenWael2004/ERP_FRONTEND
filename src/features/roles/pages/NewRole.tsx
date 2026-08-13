
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema } from '../validation.ts';
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRole,fetchPages } from '../../roles/api/roleService.ts';
import Swal from 'sweetalert2';
import { useState } from 'react';

import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';


// ============================================================
// TYPES
// ============================================================

interface Permission {
  page_id: number;
  action_id: number;
}

interface RoleFormData {
  roleNameEn: string;
  roleNameAr: string;
  route: string;
  permissions: Permission[];
}



// const availablePages = [
//   {
//     id: 4,
//     title_en: 'Users',
//     title_ar: 'المستخدمون',
//     route: '/users',
//   },
//   {
//     id: 5,
//     title_en: 'Roles',
//     title_ar: 'الأدوار',
//     route: '/roles',
//   },
// ];


// ============================================================
// AVAILABLE ACTIONS
// ============================================================

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


// ============================================================
// COMPONENT
// ============================================================

function NewRole() {
  const nav = useNavigate();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [pages,setPages] = useState([]);


  // ==========================================================
  // FORM
  // ==========================================================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(createRoleSchema),

    defaultValues: {
      roleNameEn: '',
      roleNameAr: '',
      route: '',
      permissions: [],
    },
  });


  // ==========================================================
  // CHECK PERMISSION
  // ==========================================================

  const hasPermission = (
    pageId: number,
    actionId: number,
  ) => {
    return permissions.some(
      (permission) =>
        permission.page_id === pageId &&
        permission.action_id === actionId,
    );
  };


  // ==========================================================
  // CHANGE PERMISSION
  // ==========================================================

  const handlePermissionChange = (
    pageId: number,
    actionId: number,
    checked: boolean,
  ) => {

    setPermissions((currentPermissions) => {

      const existingIndex =
        currentPermissions.findIndex(
          (permission) =>
            permission.page_id === pageId &&
            permission.action_id === actionId,
        );


      // ------------------------------------------------------
      // CHECK
      // ------------------------------------------------------

      if (checked) {

        if (existingIndex === -1) {
          return [
            ...currentPermissions,
            {
              page_id: pageId,
              action_id: actionId,
            },
          ];
        }

        return currentPermissions;
      }


      // ------------------------------------------------------
      // UNCHECK
      // ------------------------------------------------------

      return currentPermissions.filter(
        (permission) =>
          !(
            permission.page_id === pageId &&
            permission.action_id === actionId
          ),
      );
    });
  };

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


  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async (data: RoleFormData) => {

    const payload = {
      ...data,
      permissions,
    };

    console.log('Submitting:', payload);

    try {

      setIsLoading(true);

      const result = await createRole(payload);

      console.log('Create role response:', result);


      await Swal.fire({
        icon: 'success',
        title: t('SUCCESS'),
        text: t('ROLE_CREATED_SUCCESSFULLY'),
        confirmButtonText: t('OK'),
      });


      nav('/roles');

    } catch (error) {

      if (axios.isAxiosError(error)) {

        const status = error.response?.status;

        const message =
          error.response?.data?.error?.message;


        // ----------------------------------------------------
        // CONFLICT
        // ----------------------------------------------------

        if (status === 409) {

          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: message
              ? t(message)
              : t('SOMETHING_WENT_WRONG'),
            confirmButtonText: t('OK'),
          });

          return;
        }


        // ----------------------------------------------------
        // NOT FOUND
        // ----------------------------------------------------

        if (status === 404) {

          await Swal.fire({
            icon: 'error',
            title: t('ERROR'),
            text: message
              ? t(message)
              : t('SOMETHING_WENT_WRONG'),
            confirmButtonText: t('OK'),
          });

          return;
        }


        // ----------------------------------------------------
        // OTHER API ERROR
        // ----------------------------------------------------

        console.error(
          'API Error:',
          error.response?.data,
        );

        await Swal.fire({
          icon: 'error',
          title: t('ERROR'),
          text: message
            ? t(message)
            : t('SOMETHING_WENT_WRONG'),
          confirmButtonText: t('OK'),
        });

      } else {

        console.error(
          'Unexpected error:',
          error,
        );

        await Swal.fire({
          icon: 'error',
          title: t('ERROR'),
          text: t('SOMETHING_WENT_WRONG'),
          confirmButtonText: t('OK'),
        });
      }

    } finally {
      setIsLoading(false);
    }
  };


  // ==========================================================
  // JSX
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="space-y-6"
    >

      {/* =====================================================
          ROLE NAME EN
      ===================================================== */}

      <div>

        <Label htmlFor="roleNameEn">
          {t('ROLE_NAME_EN')}
        </Label>

        <Input
          id="roleNameEn"
          className="mt-2 w-full"
          {...register('roleNameEn')}
        />

        {errors.roleNameEn && (
          <span className="error-message">
            {t(errors.roleNameEn.message!)}
          </span>
        )}

      </div>


      {/* =====================================================
          ROLE NAME AR
      ===================================================== */}

      <div>

        <Label htmlFor="roleNameAr">
          {t('ROLE_NAME_AR')}
        </Label>

        <Input
          id="roleNameAr"
          className="mt-2 w-full"
          {...register('roleNameAr')}
        />

        {errors.roleNameAr && (
          <span className="error-message">
            {t(errors.roleNameAr.message!)}
          </span>
        )}

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



      {/* =====================================================
          SAVE
      ===================================================== */}

      <div className="flex justify-end">

        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? 'Saving...'
            : 'Save'}
        </Button>

      </div>

    </form>
  );
}

export default NewRole;

