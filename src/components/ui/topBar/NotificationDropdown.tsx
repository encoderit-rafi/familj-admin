import React, {useEffect, useState} from "react";
import {BellOutlined} from "@ant-design/icons";
import {Button, Dropdown, Badge, List, Typography, Empty, Spin, Tooltip, Avatar, Skeleton, Divider} from "antd";
import {useCurrentUser} from "../../../hooks/useCurrentUser.tsx";
import {useGetNotification} from "../../../query/queries/useNotificationQuery.ts";
import dayjs from "dayjs";
import {useNotificationApi} from "../../providers/NotificationProvider.tsx";
import _PUSHER from "../../../pusher.config.ts";
import {useLocation, useNavigate} from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import {useCommonMutations} from "../../../query/mutations/useCommonMutations.ts";

type notificationPayload = {
    _id?: string,
}

const NotificationDropdown: React.FC = () => {
    const location = useLocation();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    useEffect(() => {
        setDropdownVisible(false);
    }, [location.pathname]);

    const navigate = useNavigate();
    const notificationApi = useNotificationApi();
    const currentUser = useCurrentUser();
    const [notifications, setNotifications] = useState<any[]>([])
    const [newNotificationCount, setNewNotificationCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const {
        data: notificationsData = [],
        unreadCount,
        isLoading,
        refetch,
        pagination
    } = useGetNotification({
        page: currentPage,
        limit: 10,
    });

    // useEffect(() => {
    //     refetch().then(() => {
    //         if (notificationsData.length) setNotifications(notificationsData)
    //     })
    // }, [notificationsData, refetch])

    useEffect(() => {
        if (notificationsData.length) {
            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n._id));
                const newOnes = notificationsData.filter((n: any) => !existingIds.has(n._id));
                return [...prev, ...newOnes];
            });
        }
    }, [notificationsData]);

    useEffect(() => {
        const chanelName = `private-user-notification-${currentUser._id || ''}`;
        const channel = _PUSHER.subscribe(chanelName);

        channel.bind('new-private-notification', (data: any) => {
            const button = (
                data.body.action ? (
                    <Button type="primary" size="small" onClick={() => navigate(data.body.action)}>
                        Review
                    </Button>
                ) : null
            );

            notificationApi.info({
                message: data.body.title || 'New Notification',
                description: data.body.message || 'You have a new notification',
                placement: 'topRight',
                btn: button,
                key: data._id,
            });

            console.log(data);

            setNewNotificationCount((count) => count + 1);
            setNotifications((prevNotifications) => {
                const exists = prevNotifications.some((n) => n._id === data._id);
                if (exists) return prevNotifications;
                return [data, ...prevNotifications];
            });
        });

        channel.bind('pusher:subscription_succeeded', () => {
            console.log(`✅ Subscribed to channel: ${chanelName}`);
        });

        channel.bind('pusher:subscription_error', (status: number | string) => {
            console.error('❌ Subscription error:', status);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [currentUser]);


    // useEffect(() => {
    //     if (notificationsData.length) {
    //         setNotifications(prev => {
    //             // Avoid duplicate pages
    //             const existingIds = new Set(prev.map(n => n._id));
    //             const newOnes = notificationsData.filter((n: any) => !existingIds.has(n._id));
    //             return [...prev, ...newOnes];
    //         });
    //     }
    // }, [notificationsData]);

    const loadMoreData = () => {
        if (pagination?.total && notifications.length < pagination.total && currentPage < pagination.last_page) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const {useUpdateMutation} = useCommonMutations<notificationPayload>('notifications', {
        updateUrl: 'notifications/{id}/read',
    });
    const updateMutation = useUpdateMutation();

    const clickNavigation = (item: any) => {
        navigate(item.body.action || '/')
        if (!item.read) {
            updateMutation.mutate({_id: item._id}, {
                onSuccess: () => refetch?.(),
            })
        }
    }

    const items = (
        <div
            id="scrollableDiv"
            style={{width: 320, maxHeight: 500, overflowY: "auto"}}
        >
            <InfiniteScroll
                dataLength={notifications.length}
                next={loadMoreData}
                hasMore={currentPage < pagination.last_page}
                loader={<Skeleton avatar paragraph={{rows: 1}} active/>}
                endMessage={notifications.length ? <Divider plain>No more notifications</Divider> : <></>}
                scrollableTarget="scrollableDiv" // <-- now valid
            >
                <List
                    itemLayout="horizontal"
                    dataSource={notifications}
                    locale={{emptyText: <Empty/>}}
                    size="small"
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => clickNavigation(item)}
                        >
                            <List.Item.Meta
                                avatar={
                                    item?.body?.image ? (
                                        <Avatar src={item.body.image}/>
                                    ) : (
                                        <Avatar icon={<BellOutlined/>}/>
                                    )
                                }
                                title={
                                    <div>
                                        <Tooltip title={item?.body?.title}>
                                            <Typography.Text
                                                strong
                                                style={{
                                                    display: "inline-block",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    maxWidth: "100%",
                                                    color: item.read ? "#999" : "inherit",
                                                }}
                                            >
                                                {item?.body?.title}
                                            </Typography.Text>
                                        </Tooltip>
                                        {item.createdAt && (
                                            <div style={{fontSize: 12, color: "#999"}}>
                                                {dayjs(item.createdAt).format("MMM D, YYYY, h:mm A")}
                                            </div>
                                        )}
                                    </div>
                                }
                                description={item.body.message}
                                className={
                                    item.body.action
                                        ? "cursor-pointer hover:!text-blue-500"
                                        : ""
                                }
                            />
                        </List.Item>
                    )}
                />
            </InfiniteScroll>
        </div>
    );

    return (
        <Dropdown
            dropdownRender={() => items}
            trigger={['click']}
            placement="bottomRight"
            disabled={isLoading}
            arrow
            overlayClassName="bg-white shadow-lg rounded-md p-4"
            open={dropdownVisible}
            onOpenChange={(flag) => setDropdownVisible(flag)}
        >
            <Badge count={unreadCount + newNotificationCount} overflowCount={99}>
                {isLoading ? (
                    <Spin/>
                ) : (
                    <Button size="large" type="dashed" icon={<BellOutlined/>}/>
                )}
            </Badge>
        </Dropdown>
    );
};

export default NotificationDropdown;
