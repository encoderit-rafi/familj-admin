import Pusher from 'pusher-js';
import { API_V1, PUSHER_APP_CLUSTER, PUSHER_APP_KEY} from "./consts.ts";

Pusher.logToConsole = true;

// const _pusher = new Pusher(PUSHER_APP_KEY, {
//     cluster: PUSHER_APP_CLUSTER
// });
//
// export default _pusher;

const _PUSHER = new Pusher(PUSHER_APP_KEY, {
    cluster: PUSHER_APP_CLUSTER,
    authEndpoint: `${API_V1}/pusher/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    },
});

export default _PUSHER;
