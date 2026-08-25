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

interface AppPage {
  url: string;
}

interface LauncherApp {
  id: number;
  name_ar: string;
  name_en: string;
  modules: { pages: AppPage[] }[];
}

const appIcons = [administrationIcon, CRMIcon, salesIcon, employeesIcon];


function LauncherContent() {
  const { i18n } = useTranslation();
  const nav = useNavigate();
  const { hasPermission } = useAuth();
  const [apps, setApps] = useState<LauncherApp[]>([]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const response = await fetchApps();
        const availableApps: LauncherApp[] = response.data.map((app: LauncherApp) => ({
          ...app,
          modules: app.modules.map((module) => ({
            ...module,
            pages: module.pages.filter((page) => hasPermission(page.url, 'READ')),
          })),
        }));

        setApps(availableApps);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      }
    };

    loadApps();
  }, [hasPermission]);

  const launchApp = (app: LauncherApp) => {
    const landingPage = app.modules.flatMap((module) => module.pages)[0];

    if (landingPage) {
      nav(`${landingPage.url}?app=${app.id}`);
    }
  };

  return (
    <div className="launcher-content-outer-container">
        <div className="launcher-content-inner-container">
            {apps.map((app, index) => (
              <LauncherAppItem
                key={app.id}
                name={i18n.language === 'ar' ? app.name_ar : app.name_en}
                icon={appIcons[index % appIcons.length]}
                iconClass={`icon${(index % 5) + 1}`}
                onClick={() => launchApp(app)}
              />
            ))}
        </div>
    </div>
  )
}

export default LauncherContent
