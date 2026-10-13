import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Card } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { Target, Save, ArrowLeft } from 'lucide-react';

export default function AddTargetPlan() {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language.startsWith('ar');

  const [formData, setFormData] = useState({
    year: '2026',
    month: '9',
    scope: '',
    representativeId: '',
    contractsTarget: '',
    collectionsTarget: '',
  });

  const representatives = [
    {
      id: '1',
      name: 'Ahmed Hassan',
    },
    {
      id: '2',
      name: 'Mohamed Ali',
    },
    {
      id: '3',
      name: 'Omar Khaled',
    },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Target Plan:', formData);

    // Later:
    // await createTargetPlan(formData);

    nav('/targets');
  };

  return (
    <>
      <BreadcrumbComp title={t('ADD_TARGET_PLAN')} />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Target className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {t('TARGET_PLAN_DETAILS')}
              </h2>

              <p className="text-sm text-muted-foreground">
                {t('CREATE_TARGET_PLAN_DESCRIPTION')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Year + Month */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('YEAR')}
                </label>

                <Select
                  value={formData.year}
                  onValueChange={(value) =>
                    handleChange('year', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('SELECT_YEAR')} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('MONTH')}
                </label>

                <Select
                  value={formData.month}
                  onValueChange={(value) =>
                    handleChange('month', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('SELECT_MONTH')} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1">{t('JANUARY')}</SelectItem>
                    <SelectItem value="2">{t('FEBRUARY')}</SelectItem>
                    <SelectItem value="3">{t('MARCH')}</SelectItem>
                    <SelectItem value="4">{t('APRIL')}</SelectItem>
                    <SelectItem value="5">{t('MAY')}</SelectItem>
                    <SelectItem value="6">{t('JUNE')}</SelectItem>
                    <SelectItem value="7">{t('JULY')}</SelectItem>
                    <SelectItem value="8">{t('AUGUST')}</SelectItem>
                    <SelectItem value="9">{t('SEPTEMBER')}</SelectItem>
                    <SelectItem value="10">{t('OCTOBER')}</SelectItem>
                    <SelectItem value="11">{t('NOVEMBER')}</SelectItem>
                    <SelectItem value="12">{t('DECEMBER')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

           
          

            {/* Targets */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Contracts Target */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('CONTRACTS_SOLD_TARGET')}
                </label>

                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="10"
                  value={formData.contractsTarget}
                  onChange={(e) =>
                    handleChange(
                      'contractsTarget',
                      e.target.value
                    )
                  }
                />

                <p className="text-xs text-muted-foreground">
                  {t('ENTER_CONTRACT_TARGET_COUNT')}
                </p>
              </div>

              {/* Collections Target */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('COLLECTIONS_TARGET')}
                </label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="30000"
                  value={formData.collectionsTarget}
                  onChange={(e) =>
                    handleChange(
                      'collectionsTarget',
                      e.target.value
                    )
                  }
                />

                <p className="text-xs text-muted-foreground">
                  {t('ENTER_COLLECTION_TARGET_AMOUNT')}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div
              className={`flex gap-3 pt-4 ${
                isArabic ? 'justify-start' : 'justify-end'
              }`}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => nav('/targets')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('CANCEL')}
              </Button>

              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {t('SAVE_TARGET')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}