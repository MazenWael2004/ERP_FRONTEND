// import { useEffect, useMemo, useState } from 'react';

// import {
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   RefreshCw,
//   Search,
//   SlidersHorizontal,
// } from 'lucide-react';

// import * as XLSX from 'xlsx';

// import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';

// import { Badge } from 'src/components/ui/badge';

// import { Button } from 'src/components/ui/button';

// import { Card, CardContent } from 'src/components/ui/card';

// import { Input } from 'src/components/ui/input';

// import { fetchContracts } from '../api/reportsService';

// type Contract = {
//   id: number;

//   customer_id: number;

//   geographic_governorate_id: number | null;

//   geographic_district_id: number | null;

//   geographic_shiyakha_id: number | null;

//   zone_id: number | null;

//   rep_assistant_id: number | null;

//   customer_code: string | null;

//   governorate_name_ar: string | null;

//   governorate_name_en: string | null;

//   district_name_ar: string | null;

//   district_name_en: string | null;

//   shiyakha_name_ar: string | null;

//   shiyakha_name_en: string | null;
//   customer_name_ar: string | null;

//   customer_name_en: string | null;

//   parent_customer_name_ar: string | null;

//   parent_customer_name_en: string | null;

//   customer_phone: string | null;

//   last_paid_month: string | null;

//   next_subscription_due_date: string | null;
//   street: string | null;

//   building_number: string | null;

//   gln_code: string | null;

//   contract_date: string | null;

//   installation_date: string | null;

//   joining_fee_before_discount: number | null;

//   joining_fee_after_discount: number | null;

//   subscription_fee_before_discount: number | null;

//   subscription_fee_after_discount: number | null;

//   total_before_discount: number | null;

//   total_after_discount: number | null;

//   advance_payment: number | null;

//   remaining_amount: number | null;

//   joining_fee_discount_percentage: number | null;

//   subscription_fee_discount_percentage: number | null;

//   program_id: number | null;

//   plan_id: number | null;

//   contract_type_id: number | null;

//   status_id: number | null;

//   notes: string | null;

//   manager_notes: string | null;

//   subscription_price: number | null;

//   zone_name_ar: string | null;

//   program_name_ar: string | null;

//   status_name_ar: string | null;

//   additional_units_quantity: number | null;

//   hardware_items: string | null;
// };

// const PAGE_SIZE = 10;

// function amount(value: number | null | undefined) {
//   return Number(value || 0);
// }

// function formatMoney(value: number) {
//   return new Intl.NumberFormat('ar-EG', {
//     style: 'currency',

//     currency: 'EGP',

//     minimumFractionDigits: 0,

//     maximumFractionDigits: 2,
//   }).format(value);
// }

// function formatDate(value?: string | null) {
//   if (!value) return '—';

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return '—';

//   return new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(date);
// }

// function formatMonth(value?: string | null) {
//   if (!value) return '—';

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return '—';

//   return new Intl.DateTimeFormat('ar-EG', {
//     year: 'numeric',

//     month: 'long',

//     timeZone: 'Africa/Cairo',
//   }).format(date);
// }

// export default function ContractFollowUp() {
//   const [contracts, setContracts] = useState<Contract[]>([]);

//   const [isLoading, setIsLoading] = useState(true);

//   const [error, setError] = useState('');

//   const [search, setSearch] = useState('');

//   const [selectedProgram, setSelectedProgram] = useState('all');

//   const [selectedDiscount, setSelectedDiscount] = useState('all');

//   const [page, setPage] = useState(1);

//   const loadContracts = async () => {
//     setIsLoading(true);

//     setError('');

//     try {
//       const data = await fetchContracts();

//       setContracts(Array.isArray(data) ? data : []);
//     } catch {
//       setError('تعذر تحميل بيانات العقود. تحقق من الاتصال ثم أعد المحاولة.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadContracts();
//   }, []);

//   const programs = useMemo(
//     () =>
//       Array.from(new Set(contracts.map((contract) => contract.program_id).filter(Boolean))).sort(),

//     [contracts],
//   );

//   const filteredContracts = useMemo(() => {
//     const normalizedSearch = search.trim().toLocaleLowerCase('ar-EG');

//     return contracts.filter((contract) => {
//       const hasDiscount =
//         amount(contract.joining_fee_discount_percentage) > 0 ||
//         amount(contract.subscription_fee_discount_percentage) > 0;

//       const searchableText = [
//         contract.id,

//         contract.customer_id,

//         contract.customer_code,

//         contract.governorate_name_ar,

//         contract.governorate_name_en,

//         contract.district_name_ar,

//         contract.district_name_en,

//         contract.shiyakha_name_ar,

//         contract.shiyakha_name_en,
//         contract.customer_name_ar,

//         contract.customer_name_en,

//         contract.parent_customer_name_ar,

//         contract.parent_customer_name_en,
//         contract.street,

//         contract.building_number,

//         contract.gln_code,

//         contract.hardware_items,
//       ]

//         .filter(Boolean)

//         .join(' ')

//         .toLocaleLowerCase('ar-EG');

//       return (
//         (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
//         (selectedProgram === 'all' || String(contract.program_id) === selectedProgram) &&
//         (selectedDiscount === 'all' ||
//           (selectedDiscount === 'discounted' ? hasDiscount : !hasDiscount))
//       );
//     });
//   }, [contracts, search, selectedDiscount, selectedProgram]);

//   const reportColumns = [
//     { key: 'contract-id', header: 'رقم العقد', value: (contract: Contract) => `#${contract.id}` },
//     {
//       key: 'customer-name',
//       header: 'العميل',
//       value: (contract: Contract) =>
//         contract.customer_name_ar || contract.customer_name_en || `عميل #${contract.customer_id}`,
//     },
//     {
//       key: 'parent-customer-name',
//       header: 'العميل / الصيدلية الرئيسية',
//       value: (contract: Contract) => contract.parent_customer_name_ar || contract.parent_customer_name_en || '—',
//     },
//     {
//       key: 'customer-code',
//       header: 'كود العميل',
//       value: (contract: Contract) => contract.customer_code || '—',
//     },
//     {
//       key: 'governorate',
//       header: 'المحافظة',
//       value: (contract: Contract) =>
//         contract.governorate_name_ar || contract.governorate_name_en || '—',
//     },
//     {
//       key: 'district',
//       header: 'القسم / المركز',
//       value: (contract: Contract) => contract.district_name_ar || contract.district_name_en || '—',
//     },
//     {
//       key: 'shiyakha',
//       header: 'الشياخة',
//       value: (contract: Contract) => contract.shiyakha_name_ar || contract.shiyakha_name_en || '—',
//     },
//     { key: 'street', header: 'الشارع', value: (contract: Contract) => contract.street || '—' },
//     {
//       key: 'building-number',
//       header: 'رقم المبنى',
//       value: (contract: Contract) => contract.building_number || '—',
//     },
//     { key: 'gln-code', header: 'رمز GLN', value: (contract: Contract) => contract.gln_code || '—' },
//     {
//       key: 'zone-name',
//       header: 'المنطقة',
//       value: (contract: Contract) => contract.zone_name_ar ?? '—',
//     },
//     {
//       key: 'rep-assistant-name',
//       header: 'مساعد المندوب',
//       value: (contract: Contract) => contract.rep_assistant_id ?? '—',
//     },
//     {
//       key: 'contract-date',
//       header: 'تاريخ العقد',
//       value: (contract: Contract) => formatDate(contract.contract_date),
//     },
//     {
//       key: 'program-name',
//       header: 'اسم البرنامج',
//       value: (contract: Contract) => contract.program_name_ar ?? '—',
//     },
//     {
//       key: 'subscription-price',
//       header: 'سعر الاشتراك الأساسي',
//       value: (contract: Contract) => formatMoney(amount(contract.subscription_price)),
//     },
//     {
//       key: 'additional-units',
//       header: 'الوحدات الإضافية',
//       value: (contract: Contract) => amount(contract.additional_units_quantity),
//     },
//     {
//       key: 'status-name',
//       header: 'الحالة',
//       value: (contract: Contract) => contract.status_name_ar ?? '—',
//     },
//     {
//       key: 'installation-date',
//       header: 'تاريخ التركيب',
//       value: (contract: Contract) => formatDate(contract.installation_date),
//     },
//      {
//       key: 'last-paid-month',
//       header: 'آخر شهر مسدد',
//       value: (contract: Contract) => formatMonth(contract.last_paid_month),
//     },
//     {
//       key: 'next-due-date',
//       header: 'الاستحقاق القادم',
//       value: (contract: Contract) => formatDate(contract.next_subscription_due_date),
//     },
//     { key: 'notes', header: 'ملاحظات', value: (contract: Contract) => contract.notes || '—' },
//     {
//       key: 'manager-notes',
//       header: 'ملاحظات المدير',
//       value: (contract: Contract) => contract.manager_notes || '—',
//     },
//   ];
//   const totalPages = Math.max(1, Math.ceil(filteredContracts.length / PAGE_SIZE));

//   const currentPage = Math.min(page, totalPages);

//   const pageContracts = filteredContracts.slice(
//     (currentPage - 1) * PAGE_SIZE,

//     currentPage * PAGE_SIZE,
//   );

//   useEffect(() => {
//     setPage(1);
//   }, [search, selectedDiscount, selectedProgram]);

//   const exportContracts = () => {
//     const headers = reportColumns.map((column) => column.header);
//     const rows = filteredContracts.map((contract) =>
//       reportColumns.map((column) => column.value(contract)),
//     );

//     const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

//     worksheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 4, 16) }));

//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'ملخص العقود');

//     XLSX.writeFile(workbook, 'contracts-summary-report.xlsx');
//   };
//   return (
//     <div dir="rtl">
//            {' '}
//       <BreadcrumbComp
//         title="تقرير ملخص العقود"
//         items={[{ title: 'التقارير' }, { title: 'ملخص العقود' }]}
//         breadCrumbBg={undefined}
//       />
//            {' '}
//       <div className="flex flex-col gap-6">
//                          {' '}
//         <Card className="border-border bg-card shadow-sm">
//                    {' '}
//           <CardContent className="p-4 sm:p-6">
//                        {' '}
//             <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
//               <div className="relative md:col-span-2 xl:col-span-3">
//                 <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   value={search}
//                   onChange={(event) => setSearch(event.target.value)}
//                   placeholder="ابحث برقم العقد أو اسم العميل أو الهاتف أو العنوان أو GLN"
//                   className="h-11 pr-10"
//                 />
//               </div>

//               <div className="xl:col-span-2">
//                 <FilterSelect
//                   value={selectedProgram}
//                   onChange={setSelectedProgram}
//                   label="البرنامج"
//                   options={[
//                     { value: 'all', label: 'كل البرامج' },
//                     ...programs.map((program) => ({
//                       value: String(program),
//                       label: `برنامج #${program}`,
//                     })),
//                   ]}
//                 />
//               </div>

//               <div className="xl:col-span-2">
//                 <FilterSelect
//                   value={selectedDiscount}
//                   onChange={setSelectedDiscount}
//                   label="الخصم"
//                   options={[
//                     { value: 'all', label: 'كل العقود' },
//                     { value: 'discounted', label: 'بخصم' },
//                     { value: 'regular', label: 'بدون خصم' },
//                   ]}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-span-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => void loadContracts()}
//                   disabled={isLoading}
//                   className="h-11 min-w-0 whitespace-nowrap px-3"
//                 >
//                   <RefreshCw
//                     className={`ml-2 h-4 w-4 shrink-0 ${isLoading ? 'animate-spin' : ''}`}
//                   />
//                   تحديث
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={exportContracts}
//                   disabled={filteredContracts.length === 0}
//                   className="h-11 min-w-0 whitespace-nowrap px-3"
//                 >
//                   <Download className="ml-2 h-4 w-4 shrink-0" />
//                   تصدير Excel
//                 </Button>
//               </div>
//             </div>{' '}
//           </CardContent>
//                  {' '}
//         </Card>
//                {' '}
//         <Card className="overflow-hidden border-border bg-card shadow-sm">
//                    {' '}
//           <CardContent className="p-0">
//                        {' '}
//             {error ? (
//               <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
//                                 <p className="text-sm text-error">{error}</p>               {' '}
//                 <Button type="button" variant="outline" onClick={() => void loadContracts()}>
//                                     <RefreshCw className="ml-2 h-4 w-4" />                  إعادة
//                   المحاولة                {' '}
//                 </Button>
//                              {' '}
//               </div>
//             ) : isLoading ? (
//               <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
//                                 <RefreshCw className="h-4 w-4 animate-spin" />                جارٍ
//                 تحميل العقود...              {' '}
//               </div>
//             ) : (
//               <>
//                                {' '}
//                 <div className="overflow-x-auto">
//                                    {' '}
//                   <table className="w-full min-w-[6200px] text-right text-[15px]">
//                     <thead className="border-b border-border bg-muted/45 text-sm text-muted-foreground">
//                       <tr>
//                         {reportColumns.map((column) => (
//                           <th
//                             key={column.key}
//                             className="whitespace-nowrap px-5 py-5 font-semibold"
//                           >
//                             {column.header}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-border">
//                       {pageContracts.map((contract) => (
//                         <tr key={contract.id} className="transition-colors hover:bg-muted/30">
//                           {reportColumns.map((column) => (
//                             <td
//                               key={column.key}
//                               className={`px-5 py-5 ${
//                                 column.key === 'notes' ||
//                                 column.key === 'manager-notes' ||
//                                 column.key === 'hardware-items'
//                                   ? 'max-w-72 whitespace-normal'
//                                   : 'whitespace-nowrap'
//                               }`}
//                             >
//                               {column.key === 'additional-units' ? (
//                                 <Badge
//                                   variant={
//                                     amount(contract.additional_units_quantity) > 0
//                                       ? 'secondary'
//                                       : 'outline'
//                                   }
//                                   className="whitespace-nowrap px-2.5 py-1 font-medium"
//                                 >
//                                   {amount(contract.additional_units_quantity) > 0
//                                     ? `${amount(contract.additional_units_quantity).toLocaleString('ar-EG')} وحدة`
//                                     : 'لا توجد وحدات'}
//                                 </Badge>
//                               ) : column.key === 'hardware-items' ? (
//                                 contract.hardware_items ? (
//                                   <div className="flex max-w-72 flex-wrap gap-1.5">
//                                     {contract.hardware_items.split('|').map((item) => (
//                                       <span
//                                         key={item}
//                                         className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
//                                       >
//                                         {item.trim()}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 ) : (
//                                   <span className="text-muted-foreground">—</span>
//                                 )
//                               ) : (
//                                 column.value(contract)
//                               )}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                                  {' '}
//                 </div>
//                                {' '}
//                 {pageContracts.length === 0 && (
//                   <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
//                                        {' '}
//                     <SlidersHorizontal className="h-7 w-7 text-muted-foreground" />                 
//                       <p className="font-medium">لا توجد عقود مطابقة للفلاتر الحالية</p>           
//                            {' '}
//                     <p className="text-sm text-muted-foreground">جرّب تعديل البحث أو الفلاتر.</p>   
//                                  {' '}
//                   </div>
//                 )}
//                                {' '}
//                 <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
//                                    {' '}
//                   <p className="text-xs text-muted-foreground">
//                                         عرض{' '}
//                     {pageContracts.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
//                     {Math.min(currentPage * PAGE_SIZE, filteredContracts.length)} من{' '}
//                     {filteredContracts.length.toLocaleString('ar-EG')} عقد                  {' '}
//                   </p>
//                                    {' '}
//                   <div className="flex items-center gap-2">
//                                        {' '}
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setPage((value) => Math.max(1, value - 1))}
//                       disabled={currentPage === 1}
//                     >
//                                             <ChevronRight className="h-4 w-4" />                   
//                         السابق                    {' '}
//                     </Button>
//                                        {' '}
//                     <span className="min-w-20 text-center text-xs text-muted-foreground">
//                       صفحة {currentPage.toLocaleString('ar-EG')} من{' '}
//                       {totalPages.toLocaleString('ar-EG')}
//                     </span>
//                                        {' '}
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
//                       disabled={currentPage === totalPages}
//                     >
//                                             التالي                      {' '}
//                       <ChevronLeft className="mr-1 h-4 w-4" />                   {' '}
//                     </Button>
//                                      {' '}
//                   </div>
//                                  {' '}
//                 </div>
//                              {' '}
//               </>
//             )}
//                      {' '}
//           </CardContent>
//                  {' '}
//         </Card>
//              {' '}
//       </div>
//          {' '}
//     </div>
//   );
// }

// function FilterSelect({
//   label,

//   value,

//   onChange,

//   options,

//   compact = false,
// }: {
//   label: string;

//   value: string;

//   onChange: (value: string) => void;

//   options: Array<{ value: string; label: string }>;

//   compact?: boolean;
// }) {
//   return (
//     <label className={compact ? 'block w-full min-w-35' : 'block w-full'}>
//             <span className="sr-only">{label}</span>     {' '}
//       <select
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
//       >
//                {' '}
//         {options.map((option) => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//              {' '}
//       </select>
//          {' '}
//     </label>
//   );
// }
