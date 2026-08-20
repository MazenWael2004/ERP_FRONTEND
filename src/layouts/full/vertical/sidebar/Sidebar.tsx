import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import companyLogo from '../../../../assets/images/logos/b_connect_egypt_logo-removebg-preview.png';
import usersIcon from '../../../../assets/images/logos/users.png'
import { useTheme } from 'src/components/provider/theme-provider';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

import {
  AMMenu,
  AMMenuItem,
  AMSidebar,
} from 'tailwind-sidebar';

import 'tailwind-sidebar/styles.css';
import { fetchApps } from 'src/shared/api/axios';





// ============================================================
// Mock Data
// ============================================================


// const mockApps = [
//   {
//     id: 1,
//     name: 'Administration',


//     modules: [
//       {
//         id: 1,
//         name: 'User Management',

//         pages: [
//           {
//             id: 1,
//             name: 'Users',
//             icon: 'mdi:account-group',
//             url: '/users',
//           },
//           {
//             id: 2,
//             name: 'Roles',
//             icon: 'mdi:shield-account',
//             url: '/roles',
//           },
//           {
//             id: 3,
//             name: 'Employees',
//             icon: 'mdi:users',
//             url: '/employees',
//           },
//         ],
//       },
//       {
//         id: 3,
//         name: 'Settings',

//         pages: [
//           {
//             id: 4,
//             name: 'Zones',
//             icon: 'mdi:history',
//             url: '/zones',
//           },
//           {
//             id:5,
//             name:'Jobs',
//             icon: 'mdi:briefcase',
//             url:"/jobs",
//           }
//         ],
//       },
//     ],
//   },

//   {
//     id: 2,
//     name: 'Human Resources',

//     modules: [
//       {
//         id: 4,
//         name: 'Employee Management',

//         pages: [
//           {
//             id: 5,
//             name: 'Employees',
//             icon: 'mdi:account-multiple',
//             url: '/employees',
//           },
//           {
//             id: 6,
//             name: 'Jobs',
//             icon: 'mdi:briefcase',
//             url: '/jobs',
//           },
//         ],
//       },

//       {
//         id: 5,
//         name: 'Attendance',

//         pages: [
//           {
//             id: 7,
//             name: 'Attendance',
//             icon: 'mdi:calendar-check',
//             url: '/attendance',
//           },
//         ],
//       },
//     ],
//   },

//   {
//     id: 3,
//     name: 'Operations',

//     modules: [
//       {
//         id: 6,
//         name: 'Operations Management',

//         pages: [
//           {
//             id: 8,
//             name: 'Tasks',
//             icon: 'mdi:clipboard-check',
//             url: '/tasks',
//           },
//           {
//             id: 9,
//             name: 'Projects',
//             icon: 'mdi:folder-multiple',
//             url: '/projects',
//           },
//         ],
//       },
//     ],
//   },
// ];


// ============================================================
// Sidebar Item Types
// ============================================================

interface SidebarItemType {
  heading?: string;
  id?: number | string;
  name?: string;
  title?: string;
  icon?: string;
  url?: string;
  iconImage?: string;
  children?: SidebarItemType[];
  disabled?: boolean;
  isPro?: boolean;
}


// ============================================================
// Render Sidebar Items
// ============================================================

const renderSidebarItems = (
  items: SidebarItemType[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false,
  openModules?: Record<number, boolean>,
  setOpenModules?: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
) => {
  return items.map((item) => {

    // --------------------------------------------------------
    // Module Heading
    // --------------------------------------------------------

    if (item.heading) {
  const moduleId = Number(item.id);

  const isOpen =
    openModules?.[moduleId] ?? false;

  return (
    <div
      className="mb-2"
      key={item.heading}
    >
      {/* Module Header */}
      <button
        type="button"
        onClick={() =>
          setOpenModules?.((prev) => ({
            ...prev,
            [moduleId]: !isOpen,
          }))
        }
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-md
          px-2
          py-2
          text-left
          transition-colors
          hover:bg-sidebar-accent
          hover:text-sidebar-accent-foreground
        "
      >
        <span
          className="
            text-xs
            font-bold
            uppercase
            text-sidebar-foreground
          "
        >
          {item.heading}
        </span>

        <Icon
          icon={
            isOpen
              ? 'mdi:chevron-down'
              : 'mdi:chevron-right'
          }
          width={26}
          height={26}
          className="text-primary" // or text-muted-foreground, text-gray-500, etc.
        />
      </button>

      {/* Module Pages */}
      {isOpen &&
        item.children &&
        item.children.length > 0 && (
          <div className="mt-1">
            {renderSidebarItems(
              item.children,
              currentPath,
              onClose,
              true,
              openModules,
              setOpenModules,
            )}
          </div>
        )}
    </div>
  );
}

    // --------------------------------------------------------
    // Submenu
    // --------------------------------------------------------

    if (item.children && item.children.length > 0) {

      const IconComp = item.icon || null;

      // const iconElement = IconComp ? (
      //   <Icon
      //     icon={IconComp}
      //     height={21}
      //     width={21}
      //   />
      // ) : (
      //   <Icon
      //     icon="ri:checkbox-blank-circle-line"
      //     height={9}
      //     width={9}
      //   />
      // );

      const iconElement = item.iconImage ? (
  <img
    src={item.iconImage}
    alt=""
    className="h-[21px] w-[21px] object-contain"
  />
) : item.icon ? (
  <Icon
    icon={item.icon}
    height={21}
    width={21}
  />
) : (
  <Icon
    icon="ri:checkbox-blank-circle-line"
    height={9}
    width={9}
  />
);

      return (
        <div key={item.id}>
          {/* 
            You can keep this if later you want
            nested pages/submenus.
          */}
          <AMMenuItem
            icon={iconElement}
            isSelected={false}
            disabled={item.disabled}
            className="
              mt-0.5
              text-sidebar-foreground
              dark:text-sidebar-foreground
            "
          >
            <span className="truncate flex-1">
              {item.title || item.name}
            </span>
          </AMMenuItem>

          <div className="ml-4">
            {renderSidebarItems(
              item.children,
              currentPath,
              onClose,
              true,
            )}
          </div>
        </div>
      );
    }


    // --------------------------------------------------------
    // Regular Page
    // --------------------------------------------------------

    const isSelected =
      currentPath === item.url;

    const IconComp = item.icon || null;

    const iconElement = IconComp ? (
      <Icon
        icon={IconComp}
        height={21}
        width={21}
      />
    ) : (
      <Icon
        icon="ri:checkbox-blank-circle-line"
        height={9}
        width={9}
      />
    );

    const linkTarget =
      item.url?.startsWith('https')
        ? '_blank'
        : '_self';


    const itemClassNames = `
      mt-0.5
      text-sidebar-foreground
      dark:text-sidebar-foreground
      ${
        isSubItem
          ? 'ml-1'
          : ''
      }
      ${
        isSelected
          ? '!bg-transparent !text-primary'
          : ''
      }
    `;


    return (
      <div
        key={item.id}
        onClick={onClose}
      >
        <AMMenuItem
          icon={iconElement}
          isSelected={isSelected}
          link={item.url || undefined}
          target={linkTarget}
          badge={!!item.isPro}
          badgeColor="bg-lightsecondary"
          badgeTextColor="text-secondary"
          disabled={item.disabled}
          badgeContent={
            item.isPro
              ? 'Pro'
              : undefined
          }
          component={Link}
          className={itemClassNames}
        >
          <span className="truncate flex-1">
            {item.title || item.name}
          </span>
        </AMMenuItem>
      </div>
    );
  });
};


// ============================================================
// Sidebar
// ============================================================

const SidebarLayout = ({
  onClose,
}: {
  onClose?: () => void;
}) => {
 
  const [mockApps,setMockApps] = useState([]);
  const [isLoading,setLoading] = useState(false);
  const {hasPermission} = useAuth();
  const { i18n, t } = useTranslation();
  const isRTL = (i18n.resolvedLanguage ?? i18n.language) === 'ar';
  const loadApps = async () => {
  try {
    setLoading(true);

    const response = await fetchApps();
    const apps = response.data;
    const filteredApps = apps.map((app) => ({
      ...app,
      modules: app.modules.map((module) => ({
        ...module,
        pages: module.pages.filter((page) =>
          hasPermission(page.url, "READ")
        ),
      })),
    }));

    console.log(filteredApps);

    setMockApps(filteredApps);

  } catch (error) {
    console.error("Failed to fetch apps:", error);
  } finally {
    setLoading(false);
  }
};
  
    useEffect(() => {
      loadApps();
    }, []);
  const location = useLocation();
  

  const pathname =
    location.pathname;


  // ----------------------------------------------------------
  // Temporary App State
  // ----------------------------------------------------------

  const [
    selectedApp,
    setSelectedApp,
  ] = useState(1);

  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});

  // ----------------------------------------------------------
  // Find Selected App
  // ----------------------------------------------------------

  const currentApp =
    mockApps.find(
      (app) =>
        app.id === selectedApp,
    );


  // ----------------------------------------------------------
  // Theme
  // ----------------------------------------------------------

  const { theme } =
    useTheme();


  const sidebarMode =
    theme === 'light' ||
    theme === 'dark'
      ? theme
      : undefined;


  // ----------------------------------------------------------
  // Convert Modules → Sidebar Items
  // ----------------------------------------------------------
console.log(currentApp);
 const sidebarItems: SidebarItemType[] =
  currentApp?.modules.map(
    (module) => ({
      id: module.id,
      heading: i18n.language === "ar"
  ? module.name_ar
  : module.name_en,

      children:
        module.pages.map(
          (page) => ({
            id: page.id,
            name: i18n.language === "ar"
  ? page.title_ar
  : page.title_en,
            icon: page.icon,
            url: page.url,
          }),
        ),
    }),
  ) ?? [];

  // ==========================================================
  // JSX
  // ==========================================================

  return (
    <AMSidebar
      collapsible="none"
      animation={true}
      showProfile={false}
      width="270px"
      showTrigger={false}
      mode={sidebarMode}
      className={`
        fixed
        ${isRTL ? 'right-0' : 'left-0'}
        top-0
        border
        border-border
        dark:border-border
        bg-sidebar
        dark:bg-sidebar
        z-10
        h-screen
      `}
    >

      <SimpleBar
        className="h-[calc(100vh-100px)]"
      >

        <div className="px-6">
          {/* ==================================================
        Company Logo
    ================================================== */}

    <div className="flex justify-center py-5">
      <img
        src={companyLogo}
        alt="B-Connect"
        className="h-32 w-auto object-contain"
      />
    </div>



          {/* ==================================================
              App Selector
          ================================================== */}

          <div className="pt-4 pb-5">

            <label
              htmlFor="app-selector"
              className="
                mb-2
                block
                text-xs
                font-semibold
                uppercase
                text-sidebar-foreground
              "
            >
              {t('APPLICATION')}
            </label>


            <select
              id="app-selector"
              value={selectedApp}
              onChange={(e) =>
                setSelectedApp(
                  Number(e.target.value),
                )
              }
              className="
                w-full
                rounded-md
                border
                border-border
                bg-background
                px-3
                py-2
                text-sm
                text-foreground
                outline-none
                focus:ring-2
                focus:ring-primary
              "
            >

              {mockApps.map(
                (app) => (
                  <option
                    key={app.id}
                    value={app.id}
                  >
                    {i18n.language === "ar"
  ? app.name_ar
  : app.name_en}
                  </option>
                ),
              )}

            </select>

          </div>


          {/* ==================================================
              Selected App Name
          ================================================== */}

          <div className="mb-5">

            <h2
              className="
                text-lg
                font-semibold
                text-sidebar-foreground
              "
            >
              {currentApp?.name}
            </h2>

          </div>


          {/* ==================================================
              Modules + Pages
          ================================================== */}

          <div>

            {renderSidebarItems(
  sidebarItems,
  pathname,
  onClose,
  false,
  openModules,
  setOpenModules,
)}

          </div>


        </div>

      </SimpleBar>

    </AMSidebar>
  );
};


export default SidebarLayout;
