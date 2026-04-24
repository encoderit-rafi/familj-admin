import React, {createContext, useContext} from 'react';
import {message as antdMessage} from 'antd';

const MessageContext = createContext<ReturnType<typeof antdMessage.useMessage> | null>(null);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const msg = antdMessage.useMessage();

    return (
        <MessageContext.Provider value={msg}>
            {msg[1] /* contextHolder */}
            {children}
        </MessageContext.Provider>
    );
};

export const useMessageApi = () => {
    const ctx = useContext(MessageContext);
    if (!ctx) throw new Error('useMessageApi must be used within MessageProvider');
    return ctx[0]; // the `api` object
};
