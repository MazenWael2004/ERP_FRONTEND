import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { fetchPricings } from '../api/pricingService';
import { fetchZones } from 'src/features/zones/api/zoneService';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { fetchPrograms } from 'src/features/programs/api/programService.ts';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Label } from 'src/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { DataTable } from 'src/components/utilities/table/DataTable';
import { Button } from 'src/components/ui/button';
import { Plus, Download, Filter, X } from 'lucide-react';
import Swal from 'sweetalert2';
import jobIcon from '../../../assets/images/logos/job-offer.png';
import { useAuth } from 'src/features/auth/hooks/useAuth';

function ViewPricings() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('/pricings', 'WRITE');
  const canDelete = hasPermission('/pricings', 'DELETE');
  const canAdd = hasPermission('/pricings', 'CREATE');
  const isArabic = i18n.language.startsWith('ar');
  const [filterOpen, setFilterOpen] = useState(false);
  const [pricings, setPricings] = useState([]);

  const pricingColumns = [
    {
      accessorKey: 'name_en',
      header: t('PRICING_NAME_EN'),   

    },
     {
      accessorKey: 'name_ar',
      header: t('PRICING_NAME_AR'),   

    },
    {
       accessorKey: 'code',
      header: t('PRICING_CODE'), 
    },
    {
        accessorKey:isArabic? 'program_name_ar':'program_name_en',
        header:t('PROGRAM')
    },
    {
      accessorKey: 'down_payment',
      header: t('DOWN_PAYMENT'),
    },

  ];

  const loadPricings = async () => {
    try {
      setLoading(true);

      const response = await fetchPricings();

      console.log('pricings response:', response);

      setPricings(response.data);
    } catch (error) {
      console.error('Failed to fetch pricings:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPricings();
  }, []);
  return (
    <>
      <BreadcrumbComp title={t('PRICINGS_TABLE')} breadCrumbBg={jobIcon} />
      <div className="flex gap-6 flex-col ">
        <div className="flex gap-6 flex-col">
          <div className="flex justify-end gap-2">
            {canAdd && (
              <Button
                onClick={() => nav('/pricings/new-pricing')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('ADD_PRICING')}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setFilterOpen((prev) => !prev)}
              className={`transition-all duration-200 ${
                filterOpen
                  ? 'border-slate-700 bg-slate-100 text-slate-900'
                  : 'border-slate-500 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('FILTER')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="border-blue-600 text-blue-600
             hover:bg-blue-50 hover:text-blue-700
             transition-all duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('EXPORT')}
            </Button>
          </div>
        </div>
        <DataTable
          data={pricings}
          columns={pricingColumns}
        //   onEdit={
        //     canEdit
        //       ? (customer) => {
        //           handleEditCustomer(customer);
        //         }
        //       : undefined
        //   }
        //   onDelete={
        //     canDelete
        //       ? (customer) => {
        //           handleDelete(customer);
        //         }
        //       : undefined
        //   }
        />
      </div>
    </>
  );
}

export default ViewPricings;
