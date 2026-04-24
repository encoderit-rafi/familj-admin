import React, {createContext, useContext} from 'react';
import {notification} from 'antd';

const NotificationContext = createContext<ReturnType<typeof notification.useNotification> | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const noti = notification.useNotification();

    return (
        <NotificationContext.Provider value={noti}>
            {noti[1] /* contextHolder */}
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationApi = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotificationApi must be used within NotificationProvider');
    return ctx[0]; // the `api` object
};
