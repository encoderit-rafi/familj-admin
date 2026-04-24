// src/components/layout/Sidebar.tsx

import React, { useEffect } from "react";
import { Button, Menu } from "antd";
import {
  DesktopOutlined,
  PartitionOutlined,
  TagsOutlined,
  UserOutlined,
  SettingOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LogoutOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  QuestionOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import useCan from "../../../utils/can.ts";
import { Logo } from "../Logo.tsx";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: string,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label: <Link to={key}>{label}</Link>,
  } as MenuItem;
}

const Sidebar = ({
  collapsed,
  setCollapsed,
  isMobile,
  logout,
  logoutLoading,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  isMobile: boolean;
  logout: () => void;
  logoutLoading: boolean;
}) => {
  const location = useLocation();
  const can = useCan();

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  const menuItems: MenuItem[] = [];

  // Dashboard
  if (can("sidebar_dashboard")) {
    menuItems.push(getItem("Dashboard", "/", <DesktopOutlined />));
  }
  // Users
  if (can("sidebar_users")) {
    menuItems.push(getItem("Users", "/users", <UserOutlined />));
  }

  if (can("sidebar_categories"))
    menuItems.push(getItem("Categories", "/categories", <PartitionOutlined />));
  if (can("sidebar_tags"))
    menuItems.push(getItem("Tags", "/tags", <TagsOutlined />));
  if (can("sidebar_articles"))
    menuItems.push(getItem("Articles", "/articles", <FileTextOutlined />));
  //^ 🔥 CHANGE PERMISSION
  if (can("sidebar_articles"))
    menuItems.push(
      getItem("Weekly details", "/weekly-details", <FileTextOutlined />),
    );
  menuItems.push({ type: "divider" });
  if (can("sidebar_testimonials"))
    menuItems.push(
      getItem("Testimonials", "/testimonials", <FileTextOutlined />),
    );
  if (can("sidebar_checklist-templates"))
    menuItems.push(
      getItem("Checklist Templates", "/checklist-templates", <CheckCircleOutlined />),
    );
  if (can("sidebar_questions"))
    menuItems.push(getItem("Questions", "/questions", <QuestionOutlined />));

  // if (can("sidebar_questioncomment"))
  menuItems.push(
    getItem("Question Comments", "/question-comments", <FileTextOutlined />),
  );

  // Tinder
  const tinderSubItems: MenuItem[] = [];

  tinderSubItems.push(getItem("Tinder Categories", "tinder/categories"));
  tinderSubItems.push(getItem("Tinder Name", "tinder/name"));
  if (tinderSubItems.length > 0) {
    menuItems.push(
      getItem("Tinder", "/tinder", <DollarOutlined />, tinderSubItems),
    );
  }
  // Access Control
  if (can("sidebar_access_control")) {
    menuItems.push({ type: "divider" });
    menuItems.push(
      getItem("Access Control", "/access-control", <UserOutlined />),
    );
  }

  // Settings
  if (can("sidebar_settings")) {
    menuItems.push({ type: "divider" });
    menuItems.push(getItem("Settings", "/settings", <SettingOutlined />));
  }

  return (
    <>
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1 rounded-2xl">
          <div className="text-center pt-4 border-b border-gray-200 relative">
            <h1
              className={`${
                collapsed ? "text-lg" : "text-2xl"
              } mb-4 font-extralight`}
            >
              <Logo />
            </h1>
            <div
              className="absolute top-full -right-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
              style={{ boxShadow: "4px 0 6px -1px rgba(0,0,0,0.1)" }}
            >
              <Button
                type="default"
                shape="circle"
                className="flex !items-center !justify-center"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
              </Button>
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="!bg-transparent"
            style={{
              padding: "16px 0",
              maxHeight: "100vh",
              // height: '100%',
              borderRight: 0,
              overflow: "auto",
              scrollbarWidth: "thin",
              scrollbarGutter: "stable",
            }}
          />
        </div>

        <div className="mt-2">
          <Button
            block
            size="large"
            color="danger"
            variant="filled"
            icon={<LogoutOutlined />}
            loading={logoutLoading}
            onClick={logout}
          >
            {collapsed ? "" : "Logout"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
