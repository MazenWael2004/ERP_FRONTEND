import { RouterProvider } from "react-router-dom";
import router from './routes/Router';
import { useEffect } from "react";
import './css/globals.css';
import { ThemeProvider } from './components/provider/theme-provider';
import AuthProvider from "./features/auth/context/AuthProvider";
import { useTranslation } from "react-i18next";
import "./shared/api/interceptors";
import { Toaster } from "react-hot-toast";
import { DirectionProvider, MantineProvider } from "@mantine/core";

function App() {
  const { i18n } = useTranslation();

const isRTL = i18n.language === "ar";
  return (
    <>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <MantineProvider>
          <DirectionProvider initialDirection={isRTL ? "rtl" : "ltr"}>
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
