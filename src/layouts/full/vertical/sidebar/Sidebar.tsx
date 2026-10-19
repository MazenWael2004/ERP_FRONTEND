import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useMemo, useState } from 'react';

import companyLogo from '../../../../assets/images/logos/b_connect_egypt_logo-removebg-preview.png';

import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'src/components/provider/theme-provider';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

import { AMMenuItem, AMSidebar } from 'tailwind-sidebar';

import 'tailwind-sidebar/styles.css';

import { fetchApps } from 'src/shared/api/axios';
import {
  getAppIdFromSearch,
  type WorkspaceApp,
  withAppContext,
} from 'src/features/launcher/appNavigation';

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
  isRTL: boolean,
  onClose?: () => void,
  isSubItem: boolean = false,
  openModules?: Record<number, boolean>,
  setOpenModules?: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
) => {
  return items.map((item) => {
    // --------------------------------------------------------
    // Module Heading
    // --------------------------------------------------------

    if (item.heading) {
      const moduleId = Number(item.id);

      const isOpen = openModules?.[moduleId] ?? false;

      return (
        <div className="mb-2" key={item.id ?? item.heading}>
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
              icon={isOpen ? 'mdi:chevron-down' : isRTL ? 'mdi:chevron-left' : 'mdi:chevron-right'}
              width={26}
              height={26}
              className="text-primary"
            />
          </button>

          {/* Module Pages */}

          {isOpen && item.children && item.children.length > 0 && (
            <div className="mt-1">
              {renderSidebarItems(
                item.children,
                currentPath,
                isRTL,
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
    // Nested Submenu
    // --------------------------------------------------------

    if (item.children && item.children.length > 0) {
      const iconElement = item.iconImage ? (
        <img src={item.iconImage} alt="" className="h-[21px] w-[21px] object-contain" />
      ) : item.icon ? (
        <Icon icon={item.icon} height={21} width={21} />
      ) : (
        <Icon icon="ri:checkbox-blank-circle-line" height={9} width={9} />
      );

      return (
        <div key={item.id}>
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
            <span className="truncate flex-1">{item.title || item.name}</span>
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
            )}
          </div>
        </div>
      );
    }

    // --------------------------------------------------------
    // Regular Page
    // --------------------------------------------------------

    const isSelected = currentPath === item.url;

    const iconElement = item.icon ? (
      <Icon icon={item.icon} height={21} width={21} />
    ) : (
      <Icon icon="ri:checkbox-blank-circle-line" height={9} width={9} />
    );

    const linkTarget = item.url?.startsWith('https') ? '_blank' : '_self';

    const itemClassNames = `
      mt-0.5
      text-sidebar-foreground
      dark:text-sidebar-foreground
      ${isSubItem ? 'ms-1' : ''}
      ${isSelected ? '!bg-transparent !text-primary' : ''}
    `;

    return (
      <div key={item.id} onClick={onClose}>
        <AMMenuItem
          icon={iconElement}
          isSelected={isSelected}
          link={item.url}
          target={linkTarget}
          badge={!!item.isPro}
          badgeColor="bg-lightsecondary"
          badgeTextColor="text-secondary"
          disabled={item.disabled}
          badgeContent={item.isPro ? 'Pro' : undefined}
          component={Link}
          className={itemClassNames}
        >
          <span className="truncate flex-1">{item.title || item.name}</span>
        </AMMenuItem>
      </div>
    );
  });
};

// ============================================================
// Sidebar
// ============================================================

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const [apps, setApps] = useState<WorkspaceApp[]>([]);

  const [isLoading, setLoading] = useState(false);

  const { hasPermission, refreshPermissions } = useAuth();

  const { i18n, t } = useTranslation();

  const isRTL = (i18n.resolvedLanguage ?? i18n.language) === 'ar';

  const location = useLocation();

  const navigate = useNavigate();

  const pathname = location.pathname;

  const selectedApp = useMemo(() => {
    const requestedAppId = getAppIdFromSearch(location.search);
    const byId = apps.find((app) => app.id === requestedAppId);

    if (byId) return byId;

    return apps.find((app) =>
      app.modules.some((module) =>
        module.pages.some((page) => page.url === pathname),
      ),
    ) ?? apps[0];
  }, [apps, location.search, pathname]);

  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});

  // ==========================================================
  // Load Modules
  // ==========================================================

  const loadApps = async () => {
    try {
      setLoading(true);

      await refreshPermissions();
      const fetchedApps = await fetchApps();

      // ------------------------------------------------------
      // Filter pages according to READ permission
      // ------------------------------------------------------

      const permittedApps = fetchedApps
        .map((app) => ({
          ...app,
          modules: app.modules
            .map((module) => ({
              ...module,
              pages: module.pages.filter((page) => hasPermission(page.url, 'READ')),
            }))
            .filter((module) => module.pages.length > 0),
        }))
        .filter((app) => app.modules.length > 0);

      setApps(permittedApps);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Load Modules On Mount
  // ==========================================================

  useEffect(() => {
    void loadApps();
  }, []);

  // ==========================================================
  // Reset Open Modules
  // ==========================================================

  useEffect(() => {
    setOpenModules({});
  }, [pathname]);

  // ==========================================================
  // Theme
  // ==========================================================

  const { theme } = useTheme();

  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined;

  // ==========================================================
  // Convert Modules → Sidebar Items
  // ==========================================================

  const sidebarItems: SidebarItemType[] = (selectedApp?.modules ?? []).map((module) => ({
    id: module.id,

    heading: i18n.language === 'ar' ? module.name_ar : module.name_en,

    children: module.pages.map((page) => ({
      id: page.id,

      name: i18n.language === 'ar' ? page.title_ar : page.title_en,

      icon: page.icon ?? undefined,

      url: selectedApp ? withAppContext(page.url, selectedApp.id) : page.url,
    })),
  }));

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
      <SimpleBar className="h-[calc(100vh-100px)]">
        <div className="px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* ==================================================
              Company Logo
          ================================================== */}

          <div className="flex justify-center py-5">
            <img src={companyLogo} alt="B-Connect" className="h-32 w-auto object-contain" />
          </div>

          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
              {t('APPLICATION')}
            </span>
            <select
              value={selectedApp ? String(selectedApp.id) : ''}
              onChange={(event) => {
                const appId = Number(event.target.value);
                if (appId) navigate(withAppContext('/announcements', appId));
              }}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary"
              aria-label={t('APPLICATION')}
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {isRTL ? app.name_ar : app.name_en}
                </option>
              ))}
            </select>
          </label>

          {/* ==================================================
              Global Navigation
          ================================================== */}

          <div className="pb-4">
            <AMMenuItem
              icon={<Icon icon="mdi:bullhorn-outline" height={21} width={21} />}
              isSelected={pathname === '/announcements'}
              link={selectedApp ? withAppContext('/announcements', selectedApp.id) : '/announcements'}
              component={Link}
              className={`
                mt-0.5
                text-sidebar-foreground
                dark:text-sidebar-foreground
                ${pathname === '/announcements' ? '!bg-transparent !text-primary' : ''}
              `}
            >
              <span className="truncate flex-1">{t('ANNOUNCEMENTS')}</span>
            </AMMenuItem>
          </div>

          {/* ==================================================
              Modules
          ================================================== */}

          <div>
            {isLoading ? (
              <div className="space-y-3 px-2 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />

                <div className="h-4 w-32 animate-pulse rounded bg-muted" />

                <div className="h-4 w-28 animate-pulse rounded bg-muted" />

                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              renderSidebarItems(
                sidebarItems,
                pathname,
                isRTL,
                onClose,
                false,
                openModules,
                setOpenModules,
              )
            )}
          </div>
        </div>
      </SimpleBar>

      {/* ======================================================
          Back to Desk
      ======================================================= */}

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
          className={`
            h-4 w-4
            ${isRTL ? 'rotate-180' : ''}
          `}
        />

        <span>{t('BACK_TO_DESK')}</span>
      </button>
    </AMSidebar>
  );
};

export default SidebarLayout;
