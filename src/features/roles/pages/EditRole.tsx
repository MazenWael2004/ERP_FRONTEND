import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { editRole, getRoleById } from '../api/roleService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { createRoleSchema } from '../validation';

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
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRoleSchema),

    defaultValues: {
      roleNameEn: '',
      roleNameAr: '',
      route: '',
      permissions: [],
    },
  });

  const permissions = watch('permissions') || [];

  // ==========================================
  // GET ROLE
  // ==========================================

  useEffect(() => {
    if (!id) return;

    const fetchRole = async () => {
      try {
        const response = await getRoleById(Number(id));

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
          route: role.route,
          permissions: rolePermissions,
        });
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
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

  // ==========================================
  // CHECK PERMISSION
  // ==========================================

  const hasPermission = (pageId, actionId) => {
    return permissions.some(
      (permission) =>
        permission.page_id === pageId &&
        permission.action_id === actionId
    );
  };

  // ==========================================
  // CHANGE PERMISSION
  // ==========================================

  const handlePermissionChange = (
    pageId,
    actionId,
    checked
  ) => {
    const currentPermissions = [...permissions];

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

    setValue(
      'permissions',
      currentPermissions,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = async (data) => {
    if (!id) return;

    console.log('Submitting:', data);

    try {
      setIsLoading(true);

      await editRole(
        Number(id),
        data
      );

      toast.success(
        t('ROLE_UPDATED_SUCCESSFULLY')
      );

      navigate('/roles');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message;

        console.error(
          error.response?.data
        );

        if (message) {
          toast.error(t(message));
        } else {
          toast.error(
            t('SOMETHING_WENT_WRONG')
          );
        }
      } else {
        console.error(
          'Unexpected error:',
          error
        );

        toast.error(
          t('SOMETHING_WENT_WRONG')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="grid gap-6"
    >

      {/* =========================
          ROLE NAME EN
      ========================= */}

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
            {t(errors.roleNameEn.message)}
          </span>
        )}
      </div>


      {/* =========================
          ROLE NAME AR
      ========================= */}

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
            {t(errors.roleNameAr.message)}
          </span>
        )}
      </div>


      {/* =========================
          ROUTE
      ========================= */}

      <div>
        <Label htmlFor="route">
          {t('ROUTE')}
        </Label>

        <Input
          id="route"
          className="mt-2 w-full"
          {...register('route')}
        />

        {errors.route && (
          <span className="error-message">
            {t(errors.route.message)}
          </span>
        )}
      </div>


      {/* =========================
          PERMISSIONS
      ========================= */}

      <div className="mt-6">

        <Label className="text-lg font-semibold">
          Permissions
        </Label>

        <p className="mt-1 text-sm text-gray-500">
          Select which pages this role can access
          and what actions they can perform.
        </p>


        <div className="mt-4 overflow-hidden rounded-lg border">

          {/* =========================
              HEADER
          ========================= */}

          <div className="grid grid-cols-5 border-b bg-gray-50 p-4 font-semibold dark:bg-gray-800">

            <div>
              Page
            </div>

            {availableActions.map((action) => (
              <div
                key={action.id}
                className="text-center"
              >
                {action.name_en}
              </div>
            ))}

          </div>


          {/* =========================
              PAGES
          ========================= */}

          {availablePages.map((page) => (

            <div
              key={page.id}
              className="grid grid-cols-5 items-center border-b p-4 last:border-b-0"
            >

              {/* PAGE */}

              <div className="font-medium">
                {page.title_en}
              </div>


              {/* ACTIONS */}

              {availableActions.map((action) => (

                <div
                  key={`${page.id}-${action.id}`}
                  className="flex justify-center"
                >

                  <input
                    type="checkbox"

                    checked={hasPermission(
                      page.id,
                      action.id
                    )}

                    onChange={(e) =>
                      handlePermissionChange(
                        page.id,
                        action.id,
                        e.target.checked
                      )
                    }

                    className="h-4 w-4 cursor-pointer"
                  />

                </div>

              ))}

            </div>

          ))}

        </div>

      </div>


      {/* =========================
          SAVE
      ========================= */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>

    </form>
  );
}

export default EditRole;