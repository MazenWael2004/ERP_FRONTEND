export interface AppPage {
  id: number;
  title_en: string;
  title_ar: string;
  icon?: string | null;
  url: string;
  display_order: number;
}

export interface AppModule {
  id: number;
  name_en: string;
  name_ar: string;
  display_order: number;
  pages: AppPage[];
}

export interface WorkspaceApp {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  modules: AppModule[];
}

export const withAppContext = (url: string, appId: number) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}app=${appId}`;
};

export const getAppIdFromSearch = (search: string) => {
  const appId = Number(new URLSearchParams(search).get('app'));
  return Number.isInteger(appId) && appId > 0 ? appId : null;
};
