import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import companyLogo from '../../../../assets/images/logos/b_connect_egypt_logo-removebg-preview.png';
import usersIcon from '../../../../assets/images/logos/users.png'
import { ArrowLeft } from 'lucide-react';
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

interface AppPage {
  id: number | string;
  title_ar: string;
  title_en: string;
  icon?: string;
  url: string;
}

interface AppModule {
  id: number | string;
  name_ar: string;
  name_en: string;
  pages: AppPage[];
}

interface App {
  id: number;
  name?: string;
  name_ar: string;
  name_en: string;
  modules: AppModule[];
}

const withAppContext = (url: string | undefined, appId: number | undefined) => {
  if (!url || !appId || url.startsWith('https')) {
    return url;
  }

  const [pathWithQuery, hash] = url.split('#');
  const separator = pathWithQuery.includes('?') ? '&' : '?';

  return `${pathWithQuery}${separator}app=${appId}${hash ? `#${hash}` : ''}`;
};


// ============================================================
// Render Sidebar Items
// ============================================================

const renderSidebarItems = (
  items: SidebarItemType[],
  currentPath: string,
  isRTL: boolean,
  onClose?: () => void,
  isSubItem: boolean = false,
  openModules?: Record<number, boolean>,
  setOpenModules?: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  selectedAppId?: number,
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
              text-start
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
                  : isRTL
                    ? 'mdi:chevron-left'
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
                  isRTL,
                  onClose,
                  true,
                  openModules,
                  setOpenModules,
                  selectedAppId,
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

          <div className="ms-4">
            {renderSidebarItems(
              item.children,
              currentPath,
              isRTL,
              onClose,
              true,
              openModules,
              setOpenModules,
              selectedAppId,
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

    const appAwareUrl = withAppContext(item.url, selectedAppId);

    const linkTarget =
      appAwareUrl?.startsWith('https')
        ? '_blank'
        : '_self';


    const itemClassNames = `
      mt-0.5
      text-sidebar-foreground
      dark:text-sidebar-foreground
      ${
        isSubItem
          ? 'ms-1'
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
          link={appAwareUrl}
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

  const [mockApps, setMockApps] = useState<App[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { hasPermission } = useAuth();
  const { i18n, t } = useTranslation();
  const isRTL = (i18n.resolvedLanguage ?? i18n.language) === 'ar';

  const loadApps = async () => {
    try {
      setLoading(true);

      const response = await fetchApps();
      const apps: App[] = response.data;
      const filteredApps = apps.map((app) => ({
        ...app,
        modules: app.modules.map((module) => ({
          ...module,
          pages: module.pages.filter((page) =>
            hasPermission(page.url, "READ")
          ),
        })),
      }));

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
  const navigate = useNavigate();

  const pathname =
    location.pathname;


  const selectedAppFromUrl = Number(
    new URLSearchParams(location.search).get('app'),
  );

  const selectedApp =
    mockApps.some((app) => app.id === selectedAppFromUrl)
      ? selectedAppFromUrl
      : mockApps.find((app) =>
        app.modules.some((module) =>
          module.pages.some((page) => page.url === pathname),
        ),
      )?.id ?? mockApps[0]?.id;

  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setOpenModules({});
  }, [selectedApp]);

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
      dir={isRTL ? 'rtl' : 'ltr'}
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

        <div
          className="px-6"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
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
                text-start
              "
            >
              {t('APPLICATION')}
            </label>


            <select
              id="app-selector"
              value={selectedApp ?? ''}
              onChange={(e) => {
                const searchParams = new URLSearchParams(location.search);
                searchParams.set('app', e.target.value);
                navigate({
                  pathname: location.pathname,
                  search: `?${searchParams.toString()}`,
                });
              }}
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
                text-start
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
                text-start
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
              isRTL,
              onClose,
              false,
              openModules,
              setOpenModules,
              selectedApp,
            )}

          </div>


        </div>

      </SimpleBar>

      {/* ==================================================
    Back to Desk
================================================== */}

<button
  type="button"
  onClick={() => navigate('/desk')}
  className="
    mb-5
    flex
    w-full
    items-center
    justify-center
    gap-2
    rounded-md
    border
    border-border
    bg-background
    px-4
    py-2.5
    text-sm
    font-medium
    text-foreground
    transition-colors
    hover:bg-accent
    hover:text-accent-foreground
    focus:outline-none
    focus:ring-2
    focus:ring-primary
  "
>
  <ArrowLeft
    className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`}
  />

  <span>
    {t('BACK_TO_DESK')}
  </span>
</button>

    </AMSidebar>
  );
};


export default SidebarLayout;
