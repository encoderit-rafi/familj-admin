import React, {useState} from "react";
import {Avatar, message} from "antd";
import {LoadingOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Dropdown} from 'antd';
import useCookie from "../../../hooks/useCookie.tsx";
import {useCurrentUser} from "../../../hooks/useCurrentUser.tsx";
import {imageLinkGenerator} from "../../../helpers/imageLinkGenerator.ts";
import {useNavigate} from "react-router-dom";

const UserMenuDropdown: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [, , removeCookie] = useCookie('access_token');

  const items: MenuProps['items'] = [
    {key: '1', label: currentUser?.name ?? 'My Account', disabled: true,},
    {type: 'divider',},
    {key: '2', label: 'Profile', icon: <UserOutlined/>, onClick: () => navigate('/profile')},
    {
      key: '4', label: 'Logout', icon: logoutLoading ? <LoadingOutlined/> : <LogoutOutlined/>, danger: true,
      onClick: () => logout()
    },
  ];


  const logout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      localStorage.clear();
      removeCookie();
      window.location.reload();
      setLogoutLoading(false);
      // window.location.href = '/auth/login';
    }, 300);
    message.success('Logout successful');
  }
  return (
    <>
      <Dropdown menu={{items}} trigger={['click']}>
        <a className="block" onClick={(e) => e.preventDefault()}>
          {(currentUser?.avatar) ?
            <Avatar
              size="large"
              src={imageLinkGenerator(currentUser?.avatar) ?? ''}
            />
            :
            <Avatar size="large" style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
          }
        </a>
      </Dropdown>
    </>
  )
}
export default UserMenuDropdown;
