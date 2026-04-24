import "@ant-design/v5-patch-for-react-19";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/main.css";
// import './assets/styles/no-tailwind.css';
import { RouterProvider } from "react-router-dom";
import router from "./router.ts";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import {
  QueryClient,
  QueryCache,
  QueryClientProvider,
} from "@tanstack/react-query";
import { NotificationProvider } from "./components/providers/NotificationProvider.tsx";
import { MessageProvider } from "./components/providers/MessageProvider.tsx";
import { ModalProvider } from "./components/providers/ModalProvider.tsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("New content available. Reloading...");
    window.location.reload();
  });
}

interface QueryMeta {
  onError?: (error: unknown) => void;
  onSuccess?: (data: any) => void; // Adjust 'any' based on the expected data type
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const meta = query?.meta as QueryMeta;
      meta?.onError?.(error);
    },
    onSuccess: (data, query) => {
      const meta = query?.meta as QueryMeta;
      meta?.onSuccess?.(data);
    },
  }),
});

const { darkAlgorithm, defaultAlgorithm } = theme;

// 🌓 Theme Provider Component
function ThemedApp() {
  // const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
  //   return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
  // });
  const [themeMode] = useState<"dark" | "light">(() => {
    // return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
    return "light";
  });

  // persist theme in localStorage
  useEffect(() => {
    document.body.dataset.theme = themeMode;
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  // const toggleTheme = () => {
  //   setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  // };

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === "dark" ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: "#944bea",
          // colorBgLayout: themeMode === 'dark' ? '#1f2327' : '#bbd3ff',
          // colorBgLayout: themeMode === 'dark' ? '#1f2327' : '#b0bbf3',
          colorBgLayout: "#b0bbf3", // Background of page
          // colorBgContainer: '#e4e8ff',
          colorBgContainer: "#dde2fd", // Background of cards, tables, etc
          colorBgElevated: "#cfd6fd",
          colorBgBase: "#cfd6fd", // Modal, dropdown, etc ...
          colorBorder: "#b0bbf3",
          borderRadiusLG: 12,
        },
        hashed: false,
      }}
    >
      <AntdApp>
        {/*<div style={{position: 'fixed', bottom: 10, right: 10, zIndex: 1000}}>*/}
        {/*  <Button onClick={toggleTheme} type="default">*/}
        {/*    {themeMode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}*/}
        {/*  </Button>*/}
        {/*</div>*/}

        <MessageProvider>
          <NotificationProvider>
            <ModalProvider>
              <RouterProvider router={router} />
            </ModalProvider>
          </NotificationProvider>
        </MessageProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

// 🔥 Mount React app
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemedApp />
    </QueryClientProvider>
  </StrictMode>
);
