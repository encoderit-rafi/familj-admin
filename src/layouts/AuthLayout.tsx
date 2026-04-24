import {Navigate, Outlet} from "react-router-dom";
import {Flex, Layout} from "antd";
import {Content} from "antd/es/layout/layout";
import {useCurrentUser} from "../hooks/useCurrentUser.tsx";
import React, {useEffect} from "react";

const AuthLayout: React.FC = () => {
    const currentUser = useCurrentUser();

    useEffect(() => {
        currentUser?.refetch()
    }, [])

    if (currentUser?.isLoggedIn) {
        return <Navigate to="/" replace/>;
    }
    return (
        <>
            <Layout>
                <Content>
                    <Flex justify="center" align="center" style={{minHeight: '100vh'}}>
                        <Outlet/>
                    </Flex>
                </Content>
            </Layout>
        </>
    )
}

export default AuthLayout;