import React, { useEffect, useState } from "react";
import {
  Outlet,
  useMatches,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { HomeOutlined, MenuOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Input, Layout, Space, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import UserMenuDropdown from "../components/ui/topBar/UserMenuDropdown.tsx";
import NotificationDropdown from "../components/ui/topBar/NotificationDropdown.tsx";
import { useCurrentUser } from "../hooks/useCurrentUser.tsx";
import useCookie from "../hooks/useCookie.tsx";
import { useMessageApi } from "../components/providers/MessageProvider.tsx";
import Sidebar from "../components/ui/sidebar/sidebar.tsx";

const { Header, Footer, Sider } = Layout;

const siderStyle: React.CSSProperties = {
  insetInlineStart: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

export default function DashboardLayout() {
  const location = useLocation();
  const currentUser = useCurrentUser();
  const messageApi = useMessageApi();

  // mobile responsive ...
  const mobileSize = 992;
  const [isMobile, setIsMobile] = useState(window.innerWidth < mobileSize);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < mobileSize);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [, , removeCookie] = useCookie("access_token");
  const matches = useMatches();

  useEffect(() => {
    currentUser?.refetch();
  }, []);

  if (!currentUser?.isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();

  type BreadcrumbHandle = {
    breadcrumb: string | ((params: Record<string, string>) => string);
    path?: string | ((params: Record<string, string>) => string);
  };

  const breadcrumbItems = matches
    .filter(
      (match): match is typeof match & { handle: BreadcrumbHandle } =>
        !!match.handle
    )
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle;

      const params = Object.fromEntries(
        Object.entries(match.params).filter(([v]) => typeof v === "string")
      ) as Record<string, string>;

      const title =
        typeof handle.breadcrumb === "function"
          ? handle.breadcrumb(params)
          : handle.breadcrumb;

      const path =
        typeof handle.path === "function" ? handle.path(params) : handle.path;

      return {
        title,
        path,
      };
    });

  const logout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      localStorage.clear();
      removeCookie();
      window.location.reload();
      setLogoutLoading(false);
      // window.location.href = '/auth/login';
    }, 300);
    messageApi.success("Logout successful").then(() => {});
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <div className="sticky h-screen top-0 z-10">
          <Sider
            className={`${
              collapsed ? "p-1" : "p-2"
            } h-screen top-0 z-20 transition-all duration-300 ${
              isMobile ? "fixed" : "sticky"
            }`}
            width={300}
            trigger={null}
            collapsed={collapsed}
            breakpoint="lg"
            collapsedWidth={isMobile ? 0 : 80}
            onBreakpoint={(broken) => setCollapsed(broken)}
            style={{
              background: colorBgContainer,
              ...siderStyle,
              ...(isMobile && !collapsed
                ? { position: "fixed", zIndex: 1000 }
                : {}),
            }}
          >
            <Sidebar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              isMobile={isMobile}
              logout={logout}
              logoutLoading={logoutLoading}
            />
          </Sider>
          {isMobile && !collapsed && (
            <div
              className="fixed inset-0 bg-black/40 z-10"
              onClick={() => setCollapsed(true)}
            />
          )}
        </div>
        <Layout
          style={{ borderRadius: "12px !important", background: colorBgLayout }}
        >
          <Header
            className="sticky top-0 z-[9] flex flex-wrap justify-between items-center gap-2 shadow-xl"
            style={{ padding: "0 20px", background: colorBgContainer }}
          >
            {isMobile && (
              <Button
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="mr-2"
              />
            )}
            <Input.Search
              placeholder="Search anything here..."
              allowClear
              className="max-w-[400px] w-full flex-1"
              size="large"
              // style={{minWidth: 100, width: 250}}
            />
            <Space size="middle">
              <NotificationDropdown />
              <UserMenuDropdown />
            </Space>
          </Header>
          <Content className="max-w-7xl sm:mx-8 mx-6 my-6">
            {/*<Breadcrumb className="!mt-8 !mb-4" items={breadcrumbItems}/>*/}
            <Breadcrumb
              className="!mt-8 !mb-4"
              items={[
                {
                  title: (
                    <Link to="/" className="!text-blue-700">
                      <HomeOutlined />
                    </Link>
                  ),
                },
                ...breadcrumbItems.map((item) => {
                  const isActive = item.path === location.pathname;
                  return {
                    title:
                      isActive || !item.path ? (
                        <span className="text-gray-700 cursor-default">
                          {item.title}
                        </span>
                      ) : (
                        <Link to={item.path!} className="!text-blue-700">
                          {item.title}
                        </Link>
                      ),
                  };
                }),
              ]}
            />
            <div
              className="p-4 sm:p-6"
              style={{
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Familj ©{new Date().getFullYear()} Created by EncoderIT
          </Footer>
        </Layout>
      </Layout>
    </>
  );
}
