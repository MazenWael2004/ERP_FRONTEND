import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';

import { useTheme } from 'src/components/provider/theme-provider';

import {
  AMMenu,
  AMMenuItem,
  AMSidebar,
} from 'tailwind-sidebar';

import 'tailwind-sidebar/styles.css';


// ============================================================
// Mock Data
// ============================================================

const mockApps = [
  {
    id: 1,
    name: 'Administration',

    modules: [
      {
        id: 1,
        name: 'User Management',

        pages: [
          {
            id: 1,
            name: 'Users',
            icon: 'mdi:account-group',
            url: '/users',
          },
          {
            id: 2,
            name: 'Roles',
            icon: 'mdi:shield-account',
            url: '/roles',
          },
          {
            id: 3,
            name: 'Employees',
            icon: 'mdi:users',
            url: '/employees',
          },
        ],
      },

      {
        id: 2,
        name: 'Access Control',

        pages: [
          {
            id: 3,
            name: 'Permissions',
            icon: 'mdi:lock',
            url: '/permissions',
          },
        ],
      },

      {
        id: 3,
        name: 'Settings',

        pages: [
          {
            id: 4,
            name: 'Zones',
            icon: 'mdi:history',
            url: '/zones',
          },
        ],
      },
    ],
  },

  {
    id: 2,
    name: 'Human Resources',

    modules: [
      {
        id: 4,
        name: 'Employee Management',

        pages: [
          {
            id: 5,
            name: 'Employees',
            icon: 'mdi:account-multiple',
            url: '/employees',
          },
          {
            id: 6,
            name: 'Jobs',
            icon: 'mdi:briefcase',
            url: '/jobs',
          },
        ],
      },

      {
        id: 5,
        name: 'Attendance',

        pages: [
          {
            id: 7,
            name: 'Attendance',
            icon: 'mdi:calendar-check',
            url: '/attendance',
          },
        ],
      },
    ],
  },

  {
    id: 3,
    name: 'Operations',

    modules: [
      {
        id: 6,
        name: 'Operations Management',

        pages: [
          {
            id: 8,
            name: 'Tasks',
            icon: 'mdi:clipboard-check',
            url: '/tasks',
          },
          {
            id: 9,
            name: 'Projects',
            icon: 'mdi:folder-multiple',
            url: '/projects',
          },
        ],
      },
    ],
  },
];


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
) => {
  return items.map((item) => {

    // --------------------------------------------------------
    // Module Heading
    // --------------------------------------------------------

    if (item.heading) {
      return (
        <div
          className="mb-4"
          key={item.heading}
        >
          <AMMenu
            subHeading={item.heading}
            ClassName="
              hide-menu
              leading-21
              text-sidebar-foreground
              font-bold
              uppercase
              text-xs
              dark:text-sidebar-foreground
            "
          />

          {/* Pages inside this module */}
          {item.children && item.children.length > 0 && (
            <div className="mt-1">
              {renderSidebarItems(
                item.children,
                currentPath,
                onClose,
                true,
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

  const sidebarItems: SidebarItemType[] =
    currentApp?.modules.map(
      (module) => ({
        heading: module.name,

        children:
          module.pages.map(
            (page) => ({
              id: page.id,
              name: page.name,
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
      className="
        fixed
        left-0
        top-0
        border
        border-border
        dark:border-border
        bg-sidebar
        dark:bg-sidebar
        z-10
        h-screen
      "
    >

      <SimpleBar
        className="h-[calc(100vh-100px)]"
      >

        <div className="px-6">


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
              Application
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
                    {app.name}
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
            )}

          </div>


        </div>

      </SimpleBar>

    </AMSidebar>
  );
};


export default SidebarLayout;

