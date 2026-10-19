import { useEffect, useState } from 'react';
import LauncherAppItem from './LauncherAppItem';
import employeesIcon from '../../../assets/images/logos/employees.png';
import CRMIcon from '../../../assets/images/logos/CRM.png';
import administrationIcon from '../../../assets/images/logos/administrator.png'
import salesIcon from '../../../assets/images/logos/sales.png';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { fetchApps } from 'src/shared/api/axios';
import { useAuth } from 'src/features/auth/hooks/useAuth';
import type { WorkspaceApp } from '../appNavigation';
import { withAppContext } from '../appNavigation';

const appIcons: Record<string, string> = {
  administration: administrationIcon,
  crm: CRMIcon,
  sales: salesIcon,
  employees: employeesIcon,
};


function LauncherContent() {
  const { i18n } = useTranslation();
  const nav = useNavigate();
  const { hasPermission, refreshPermissions } = useAuth();
  const [apps, setApps] = useState<WorkspaceApp[]>([]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        await refreshPermissions();
        const response = await fetchApps();
        const availableApps = response.map((app) => ({
          ...app,
          modules: app.modules.map((module) => ({
            ...module,
            pages: module.pages.filter((page) => hasPermission(page.url, 'READ')),
          })),
        }));

        setApps(
          availableApps.filter((app) =>
            app.modules.some((module) => module.pages.length > 0),
          ),
        );
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      }
    };

    void loadApps();
  }, []);

  const launchApp = (app: WorkspaceApp) => {
    nav(withAppContext('/announcements', app.id));
  };

  return (
    <div className="launcher-content-outer-container">
        <div className="launcher-content-inner-container">
            {apps.map((app, index) => (
              <LauncherAppItem
                key={app.id}
                name={i18n.language === 'ar' ? app.name_ar : app.name_en}
                icon={appIcons[app.code.toLowerCase()] ?? appIcons[index % Object.keys(appIcons).length]}
                iconClass={`icon${(index % 5) + 1}`}
                onClick={() => launchApp(app)}
              />
            ))}
        </div>
    </div>
  )
}

export default LauncherContent
