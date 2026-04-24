import React, {createContext, useContext} from 'react';
import {Modal as AntdModal} from 'antd';

const ModalContext = createContext<ReturnType<typeof AntdModal.useModal> | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const modal = AntdModal.useModal(); // [modalApi, contextHolder]

    return (
        <ModalContext.Provider value={modal}>
            {modal[1] /* contextHolder */}
            {children}
        </ModalContext.Provider>
    );
};

export const useModalApi = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModalApi must be used within ModalProvider');
    return ctx[0]; // the `modal` API (confirm/info/warning/error/success)
};
