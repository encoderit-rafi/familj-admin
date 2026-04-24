import type {ReactNode} from "react";
import {Typography} from "antd";

type StatCardProps = {
    title?: string;
    icon?: ReactNode;
    count?: ReactNode;
    className?: string;
};

export default function StatCard({title = "", icon, count = 0, className = "",}: StatCardProps) {
    return (
        <div
            className={`flex items-center gap-4 bg-gray-50 shadow-md hover:shadow transition duration-200 rounded-lg p-4 border border-blue-200 ${className}`}
        >
            {icon && (
                <div className="bg-blue-100 rounded-full p-1 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <div>
                {title && <Typography.Text strong>{title}</Typography.Text>}
                {/*{count && (*/}
                <Typography.Title level={2} className="!my-0 py-0 !text-blue-300">
                    {count}
                </Typography.Title>
                {/*)}*/}
            </div>
        </div>
    );
}
