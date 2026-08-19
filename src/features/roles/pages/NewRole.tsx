import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema } from '../validation.ts';
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRole, fetchPages, checkRoleExists } from '../../roles/api/roleService.ts';
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
  const [pages, setPages] = useState([]);

  // ==========================================================
  // FORM
  // ==========================================================

  const {
    register,
    handleSubmit,
    setError,
    watch,
    clearErrors,
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

  const name_en = watch('roleNameEn');
  const name_ar = watch('roleNameAr');

  const checkFieldExists = async (
    field: 'name_en' | 'name_ar',
    value: string,
    formField: 'roleNameEn' | 'roleNameAr',
    errorMessage: string,
  ) => {
    try {
      const response = await checkRoleExists(field, value, null);

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

  // ==========================================================
  // CHECK PERMISSION
  // ==========================================================

  const hasPermission = (pageId: number, actionId: number) => {
    return permissions.some(
      (permission) => permission.page_id === pageId && permission.action_id === actionId,
    );
  };

  // ==========================================================
  // CHANGE PERMISSION
  // ==========================================================

  const handlePermissionChange = (pageId: number, actionId: number, checked: boolean) => {
    setPermissions((currentPermissions) => {
      // If checking a permission
      if (checked) {
        const alreadyExists = currentPermissions.some(
          (permission) => permission.page_id === pageId && permission.action_id === actionId,
        );

        if (alreadyExists) {
          return currentPermissions;
        }

        return [
          ...currentPermissions,
          {
            page_id: pageId,
            action_id: actionId,
          },
        ];
      }

      // If UNCHECKING Read
      if (actionId === 1) {
        // Remove ALL permissions for this page
        return currentPermissions.filter((permission) => permission.page_id !== pageId);
      }

      // If unchecking Write/Create/Delete,
      // remove only that specific permission
      return currentPermissions.filter(
        (permission) => !(permission.page_id === pageId && permission.action_id === actionId),
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
        showConfirmButton: false,
        timer: 1500,
      });

      nav('/roles');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message;

        console.log('Backend message:', message);

        if (t(message) === 'Role name En already exists') {
          setError('roleNameEn', {
            type: 'server',
            message: 'ROLE_NAME_EN_EXISTS',
          });
          return;
        }

        if (t(message) === 'Role name Ar already exists') {
          setError('roleNameAr', {
            type: 'server',
            message: 'ROLE_NAME_AR_EXISTS',
          });
          return;
        }
      }

      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // JSX
  // ==========================================================

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
      {/* =====================================================
          ROLE NAME EN
      ===================================================== */}

      <div>
        <Label htmlFor="roleNameEn">
          {t('ROLE_NAME_EN')}
          <span className="ml-1 text-red-500">*</span>
        </Label>

        <Input id="roleNameEn" className="mt-2 w-full" {...register('roleNameEn')} />

        {errors.roleNameEn && (
          <span className="error-message">{t(errors.roleNameEn.message!)}</span>
        )}
      </div>

      {/* =====================================================
          ROLE NAME AR
      ===================================================== */}

      <div>
        <Label htmlFor="roleNameAr">
          {t('ROLE_NAME_AR')}
          <span className="ml-1 text-red-500">*</span>
        </Label>

        <Input id="roleNameAr" className="mt-2 w-full" {...register('roleNameAr')} />

        {errors.roleNameAr && (
          <span className="error-message">{t(errors.roleNameAr.message!)}</span>
        )}
      </div>

      {/* =====================================================
    PERMISSIONS
===================================================== */}

      <div className="mt-4">
        <Label className="text-base font-semibold">Permissions</Label>

        <p className="mt-1 text-xs text-gray-500">
          Select the actions this role can perform for each page.
        </p>

        {/* TWO COLUMN LAYOUT */}

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {pages.map((page) => (
            <div key={page.id} className="overflow-hidden rounded-md border">
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
                      checked={hasPermission(page.id, action.id)}
                      onChange={(e) => handlePermissionChange(page.id, action.id, e.target.checked)}
                      className="
                                    h-3.5
                                    w-3.5
                                    cursor-pointer
                                "
                    />

                    <span>{action.name_en}</span>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default NewRole;
