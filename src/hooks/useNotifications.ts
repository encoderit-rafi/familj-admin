import {useEffect} from 'react';
import _pusher from "../pusher.config.ts";
import {useCurrentUser} from "./useCurrentUser.tsx";

const useNotifications = () => {
    const currentUser = useCurrentUser();
    useEffect(() => {
        const channel = _pusher.subscribe('user-' + currentUser._id);
        channel.bind('new-notification', function (data: any) {
            console.log(data)
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [currentUser]);
};

export default useNotifications;