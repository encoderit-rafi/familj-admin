import {Progress} from "antd";

export default function RatingProgress({title = 0, percent = 0,}) {
    return (
        <div className="flex items-center justify-center gap-2">
            <strong className="pt-1">{title ? title : ''}</strong>
            <Progress
                percent={percent}
                percentPosition={{align: 'center', type: 'inner'}}
                size={{height: 20,}}
                style={{maxWidth: '100%'}}
                strokeColor="#B7EB8F"
            />
        </div>
    )
}