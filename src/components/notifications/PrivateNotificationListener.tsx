// src/components/PrivateNotificationListener.tsx
import {useEffect} from 'react';
import Pusher from 'pusher-js';
import {API_V1, PUSHER_APP_CLUSTER, PUSHER_APP_KEY} from "../../consts.ts";

export default function PrivateNotificationListener({userId}: { userId: string }) {
    useEffect(() => {
        const pusher = new Pusher(PUSHER_APP_KEY, {
            cluster: PUSHER_APP_CLUSTER,
            authEndpoint: `${API_V1}/`, // NestJS endpoint
            auth: {
                headers: {
                    // Optionally include a token for user identification
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            },
        });

        const channel = pusher.subscribe(`private-user-${userId}`);

        channel.bind('new-private-notification', (data: any) => {
            alert(`Private: ${data}`);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [userId]);

    return null;
}
