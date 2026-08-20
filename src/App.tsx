import { RouterProvider } from "react-router-dom";
import router from './routes/Router';
import { useLayoutEffect } from "react";
import './css/globals.css';
import { ThemeProvider } from './components/provider/theme-provider';
import AuthProvider from "./features/auth/context/AuthProvider";
import { useTranslation } from "react-i18next";
import "./shared/api/interceptors";
import { Toaster } from "react-hot-toast";
import { DirectionProvider, MantineProvider } from "@mantine/core";

function App() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const isRTL = language === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  useLayoutEffect(() => {
    const root = window.document.documentElement;

    root.lang = language;
    root.dir = direction;
  }, [direction, language]);

  return (
    <>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <MantineProvider>
          <DirectionProvider key={direction} initialDirection={direction}>
          <RouterProvider router={router} />
           <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              fontFamily: "Cairo, sans-serif",
            },
          }}
        />
        </DirectionProvider>
        </MantineProvider>
      </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
