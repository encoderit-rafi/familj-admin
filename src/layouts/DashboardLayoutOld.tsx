import React, {useEffect, useState} from 'react';
import {Outlet, useMatches, Link, useLocation, Navigate} from 'react-router-dom';
import {
    BankOutlined,
    DesktopOutlined, DollarOutlined,
    HomeOutlined, LogoutOutlined,
    SettingOutlined, PartitionOutlined, PrinterOutlined, ShoppingCartOutlined, ShoppingOutlined, TagsOutlined,
    UserOutlined, DoubleLeftOutlined, DoubleRightOutlined, MenuOutlined,
} from '@ant-design/icons';
import {Breadcrumb, Button, Input, Layout, Menu, Space, theme} from 'antd';

import type {MenuProps} from 'antd';
import {Content} from 'antd/es/layout/layout';
import UserMenuDropdown from "../components/ui/topBar/UserMenuDropdown.tsx";
import NotificationDropdown from "../components/ui/topBar/NotificationDropdown.tsx";
import {useCurrentUser} from "../hooks/useCurrentUser.tsx";
import useCookie from "../hooks/useCookie.tsx";
import {useMessageApi} from "../components/providers/MessageProvider.tsx";

const {Header, Footer, Sider} = Layout;

type MenuItem = Required<MenuProps>['items'][number];

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

const siderStyle: React.CSSProperties = {
    insetInlineStart: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
};

const sideBarItems: MenuItem[] = [
    getItem('Dashboard', '/', <DesktopOutlined/>),
    getItem('Users', '/users', <UserOutlined/>),
    getItem('Store', '/stores', <HomeOutlined/>, [
        getItem('Products', '/stores/products', <ShoppingOutlined/>),
        getItem('Categories', '/stores/categories', <PartitionOutlined/>),
        getItem('Brands', '/stores/brands', <PrinterOutlined/>),
        getItem('Tags', '/stores/tags', <TagsOutlined/>),
    ]),
    getItem('Purchase', '/purchase', <DollarOutlined/>, [
        getItem('Orders', '/purchase/orders', <ShoppingCartOutlined/>),
        getItem('Payment', '/purchase/payment', <BankOutlined/>),
    ]),
    {type: 'divider',},
    getItem('Access Control', '/access-control', <UserOutlined/>),
    {type: 'divider',},
    getItem('Settings', '/settings', <SettingOutlined/>),
];

export default function DashboardLayoutOld() {
    const location = useLocation();
    const currentUser = useCurrentUser();
    const messageApi = useMessageApi();

    // mobile responsive ...
    const mobileSize = 992
    const [isMobile, setIsMobile] = useState(window.innerWidth < mobileSize);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < mobileSize);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
    }, [location.pathname, isMobile]);

    const [collapsed, setCollapsed] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [, , removeCookie] = useCookie('access_token');
    const matches = useMatches();

    useEffect(() => {
        currentUser?.refetch()
    }, [])

    if (!currentUser?.isLoggedIn) {
        return <Navigate to="/auth/login" replace/>;
    }

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    type BreadcrumbHandle = {
        breadcrumb: string | ((params: Record<string, string>) => string);
        path?: string | ((params: Record<string, string>) => string);
    };

    const breadcrumbItems = matches
        .filter((match): match is typeof match & { handle: BreadcrumbHandle } => !!match.handle)
        .map((match) => {
            const handle = match.handle as BreadcrumbHandle;

            const params = Object.fromEntries(
                Object.entries(match.params).filter(([v]) => typeof v === 'string')
            ) as Record<string, string>;

            const title =
                typeof handle.breadcrumb === 'function'
                    ? handle.breadcrumb(params)
                    : handle.breadcrumb;

            const path =
                typeof handle.path === 'function'
                    ? handle.path(params)
                    : handle.path;

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
        messageApi.success('Logout successful').then(() => {
        });
    }

    return (
        <>
            <Layout style={{minHeight: '100vh'}}>
                <div className="sticky h-screen top-0 z-10">
                    <Sider
                        className={`${collapsed ? 'p-1' : 'p-2'} h-screen top-0 z-20 transition-all duration-300 ${
                            isMobile ? 'fixed' : 'sticky'
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
                            ...(isMobile && !collapsed ? {position: 'fixed', zIndex: 1000} : {}),
                        }}
                    >
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex-1 rounded-2xl bg-gradient-to-bl from-[#68daf900] to-[#ccfbf100]">
                                <div className="text-center pt-4 border-b border-gray-200 relative">
                                    <h1 className={`${collapsed ? 'text-lg' : 'text-2xl'}  mb-4 font-extralight`}>Familj</h1>
                                    {/*<Title level={collapsed ? 5 : 3}>By You</Title>*/}

                                    <div
                                        className="absolute top-full -right-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                                        style={{boxShadow: '4px 0 6px -1px rgba(0,0,0,0.1)'}}
                                    >
                                        <Button
                                            type="default"
                                            color="primary"
                                            shape="circle"
                                            className="flex !items-center !justify-center"
                                            onClick={() => setCollapsed(!collapsed)}
                                        >
                                            {collapsed ? <DoubleRightOutlined/> : <DoubleLeftOutlined/>}
                                        </Button>
                                    </div>
                                </div>
                                <Menu
                                    mode="inline"
                                    selectedKeys={[location.pathname]}
                                    items={sideBarItems}
                                    className="!bg-transparent"
                                    style={{
                                        padding: '16px 0',
                                        maxHeight: '100vh',
                                        // height: '100%',
                                        borderRight: 0,
                                        overflow: 'auto',
                                        scrollbarWidth: 'thin',
                                        scrollbarGutter: 'stable',
                                    }}
                                />
                            </div>

                            <div className="mt-2">
                                <Button
                                    block
                                    size="large"
                                    color="danger"
                                    variant="filled"
                                    icon={<LogoutOutlined/>}
                                    loading={logoutLoading}
                                    onClick={() => logout()}
                                >
                                    {collapsed ? '' : 'Logout'}
                                </Button>
                            </div>
                        </div>
                    </Sider>
                    {isMobile && !collapsed && (
                        <div
                            className="fixed inset-0 bg-black/40 z-10"
                            onClick={() => setCollapsed(true)}
                        />
                    )}
                </div>
                <Layout style={{borderRadius: '12px !important', background: '#eef4fd'}}>
                    <Header
                        className="sticky top-0 z-[9] flex flex-wrap justify-between items-center gap-2 shadow-xl"
                        style={{padding: '0 20px', background: colorBgContainer}}
                    >
                        {isMobile && (
                            <Button
                                icon={<MenuOutlined/>}
                                onClick={() => setCollapsed(!collapsed)}
                                className="mr-2"
                            />
                        )}
                        <Input.Search
                            placeholder="Search anything here..."
                            allowClear
                            className="max-w-[400px] w-full flex-1"
                            // style={{minWidth: 100, width: 250}}
                        />
                        <Space size="middle">
                            <NotificationDropdown/>
                            <UserMenuDropdown/>
                        </Space>
                    </Header>
                    <Content style={{margin: '0 16px'}}>
                        {/*<Breadcrumb className="!mt-8 !mb-4" items={breadcrumbItems}/>*/}
                        <Breadcrumb
                            className="!mt-8 !mb-4"
                            items={[
                                {
                                    title: <Link to="/" className="!text-blue-600"><HomeOutlined/></Link>,
                                },
                                ...breadcrumbItems.map(item => ({
                                    title: item.path ? <Link to={item.path} className="!text-blue-600">{item.title}</Link> :
                                        <span className="text-gray-400 cursor-default">{item.title}</span>,
                                }))]}
                        />
                        <div
                            className="p-4 sm:p-6"
                            style={{
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Outlet/>
                        </div>
                    </Content>
                    <Footer style={{textAlign: 'center'}}>
                      Familj ©{new Date().getFullYear()} Created by EncoderIT
                    </Footer>
                </Layout>
            </Layout>
        </>
    );
}
