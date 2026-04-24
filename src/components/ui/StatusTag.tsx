import {Tag} from "antd";

export default function StatusTag({status = "",}) {
    const statusColorMap: Record<'active' | 'inactive' | 'pending' | 'suspended', string> = {
        active: 'green',
        inactive: 'red',
        pending: 'orange',
        suspended: '#5c0011',
    };

    return (
        <Tag color={statusColorMap[status as keyof typeof statusColorMap] || 'gray'}>{status.toUpperCase()}</Tag>
    )
}
